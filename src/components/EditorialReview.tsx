import {useEffect,useRef,useState} from 'react';
import {formatReaderDate} from '@/lib/date-format';
import {isZonedTimestamp,localEventTimeToISO,rhodeIslandEventPreview,toLocalEventInput} from '@/lib/event-time';

type EditorialEntry={title?:string;summary?:string;aiQuote?:string;ai_evidence?:string;usefulness?:string;local_evidence?:string;kind?:string;towns?:string[];startsAt?:string|null;starts_at?:string|null;endsAt?:string|null;ends_at?:string|null;status?:string};
type EditorialState={version:number;canApprove:boolean;approvalBlocker?:string|null;entry?:EditorialEntry|null;review?:Record<string,unknown>|null;history?:{version:number;action:string;note:string;reviewedAt:string}[]};
type Draft={title:string;summary:string;aiQuote:string;usefulness:string;kind:string;towns:string[];startsAt:string;endsAt:string;note:string};
type Action='note'|'approve'|'reject'|'withdraw';
const coverageOptions=['Newport','Middletown','Portsmouth','Jamestown','Tiverton','Little Compton','Bristol','Barrington','Providence','Rhode Island','South Coast','Regional','Global'];
const kinds=['news','event','program','job','policy','opportunity','other'];

export default function EditorialReview({id,title,aiQuote='',suggestedUsefulness='',onSaved}:{id:string;title:string;aiQuote?:string;suggestedUsefulness?:string;onSaved?:(action:Action)=>void}) {
  const [open,setOpen]=useState(false),[state,setState]=useState<EditorialState|null>(null),[busy,setBusy]=useState(false);
  const [error,setError]=useState(''),[message,setMessage]=useState(''),[reload,setReload]=useState(0),[conflict,setConflict]=useState(false);
  const [eventInputMode,setEventInputMode]=useState<'local'|'iso'>('local');
  const feedbackRef=useRef<HTMLParagraphElement>(null),[feedbackAttempt,setFeedbackAttempt]=useState(0);
  const browserZone=Intl.DateTimeFormat().resolvedOptions().timeZone||'your device’s local time zone';
  const [draft,setDraft]=useState<Draft>({title,summary:'',aiQuote,usefulness:suggestedUsefulness,kind:'news',towns:[],startsAt:'',endsAt:'',note:''});
  function hydrate(data:EditorialState) {
    setState(data);
    const entry=data.entry,review=data.review;
    // Older note/reject records contain no draft. Only fields actually saved in
    // a structured review may override the publication or its evidence defaults.
    const text=(key:string,fallback:string)=>typeof review?.[key]==='string'?review[key] as string:fallback;
    const savedStart=text('startsAt',entry?.startsAt??entry?.starts_at??'');
    const savedEnd=text('endsAt',entry?.endsAt??entry?.ends_at??'');
    const exactTimeMode=[savedStart,savedEnd].some(value=>{
      if(!value)return false;
      const local=toLocalEventInput(value);
      return local?!!localEventTimeToISO(local).error:!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value);
    });
    setEventInputMode(exactTimeMode?'iso':'local');
    const restoreTime=(value:string)=>exactTimeMode?value:(toLocalEventInput(value)||value);
    const savedKind=text('kind',entry?.status==='rejected'&&entry.kind==='other'&&!entry.summary?'news':entry?.kind??'news');
    setDraft({title:text('title',entry?.title??title),summary:text('summary',entry?.summary??''),aiQuote:text('aiQuote',entry?.aiQuote??entry?.ai_evidence??aiQuote),usefulness:text('usefulness',entry?.usefulness??entry?.local_evidence??suggestedUsefulness),kind:kinds.includes(savedKind)?savedKind:'news',towns:Array.isArray(review?.towns)&&review.towns.every(value=>typeof value==='string')?review.towns as string[]:entry?.towns??[],startsAt:restoreTime(savedStart),endsAt:restoreTime(savedEnd),note:''});
  }
  useEffect(()=>{if(error){feedbackRef.current?.focus();feedbackRef.current?.scrollIntoView?.({block:'nearest'});}},[error,feedbackAttempt]);
  useEffect(()=>{
    if(!open)return;
    const controller=new AbortController();setBusy(true);setError('');setConflict(false);setState(null);
    fetch('/api/aqai/editorial?id='+encodeURIComponent(id),{signal:controller.signal}).then(async response=>{if(!response.ok)throw Error('Editorial history could not be loaded. Try again.');return response.json();})
      .then(data=>{if(!controller.signal.aborted)hydrate(data);})
      .catch(reason=>{if(!controller.signal.aborted)setError(reason.message);})
      .finally(()=>{if(!controller.signal.aborted)setBusy(false);});
    return()=>controller.abort();
  },[id,open,reload]);

  function field<K extends keyof Draft>(key:K,value:Draft[K]){setDraft(current=>({...current,[key]:value}));setMessage('');}
  function resolveTime(value:string) {
    return eventInputMode==='local'?localEventTimeToISO(value):isZonedTimestamp(value)?{iso:new Date(value).toISOString()}:{error:'Enter a full ISO timestamp ending in Z or an explicit UTC offset.'};
  }
  function changeTimeMode(mode:'local'|'iso') {
    if(mode===eventInputMode)return;
    const convert=(value:string,original?:string|null)=>{
      if(!value)return '';
      if(mode==='local')return toLocalEventInput(value)||value;
      const resolved=localEventTimeToISO(value);
      return resolved.iso||(original&&toLocalEventInput(original)===value?original:value);
    };
    const originalTime=(key:'startsAt'|'endsAt')=>typeof state?.review?.[key]==='string'?state.review[key] as string:key==='startsAt'?state?.entry?.startsAt??state?.entry?.starts_at:state?.entry?.endsAt??state?.entry?.ends_at;
    setDraft(current=>({...current,startsAt:convert(current.startsAt,originalTime('startsAt')),endsAt:convert(current.endsAt,originalTime('endsAt'))}));
    setEventInputMode(mode);setError('');setMessage('');
  }
  const startResult=draft.startsAt?resolveTime(draft.startsAt):null;
  const endResult=draft.endsAt?resolveTime(draft.endsAt):null;
  const eventError=draft.kind!=='event'?'':!startResult?.iso||(draft.endsAt&&!endResult?.iso)?startResult?.error||endResult?.error||'Choose the event start date and time.':Date.parse(startResult.iso)<=Date.now()?'New event approval requires a future start time. Keep a past event as historical material.':endResult?.iso&&Date.parse(endResult.iso)<Date.parse(startResult.iso)?'The event end must not precede its start.':'';
  const approvalChecks=[
    {label:'Title',ready:!!draft.title.trim()},
    {label:'Reader summary',ready:!!draft.summary.trim()},
    {label:'Exact AI quote (verified against evidence when saved)',ready:!!draft.aiQuote.trim()},
    {label:'Why this is useful to readers',ready:!!draft.usefulness.trim()},
    {label:'Coverage — select 1 to 10 supported places',ready:draft.towns.length>0&&draft.towns.length<=10},
    {label:'Content type',ready:kinds.includes(draft.kind)},
    ...(draft.kind==='event'?[{label:'Verified future event time',ready:!eventError}]:[]),
    {label:'Editorial note',ready:!!draft.note.trim()}
  ];
  const missingFields=approvalChecks.filter(check=>!check.ready);
  async function save(action:Action) {
    setError('');setMessage('');setFeedbackAttempt(value=>value+1);
    if(!state||busy||conflict)return;
    if(action==='approve') {
      if(!state.canApprove){setError(state.approvalBlocker||'This record cannot be published from the available evidence.');return;}
      if(missingFields.length){setError('Not published. Complete: '+missingFields.map(check=>check.label).join('; ')+'.'+(eventError?' '+eventError:''));return;}
    }
    if(!draft.note.trim()){setError('Add an editorial note explaining this decision.');return;}
    setBusy(true);
    let receivedResponse=false;
    try {
      const readerDraft={title:draft.title.trim(),summary:draft.summary.trim(),aiQuote:draft.aiQuote.trim(),usefulness:draft.usefulness.trim(),kind:draft.kind,towns:draft.towns,startsAt:draft.startsAt?(startResult?.iso||draft.startsAt):'',endsAt:draft.endsAt?(endResult?.iso||draft.endsAt):''};
      const response=await fetch('/api/aqai/editorial',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,expectedVersion:state.version,action,note:draft.note.trim(),...(action==='withdraw'?{}:readerDraft),...(action==='approve'?{startsAt:draft.kind==='event'?startResult.iso:null,endsAt:draft.kind==='event'&&endResult?.iso?endResult.iso:null}:{})})});
      receivedResponse=true;
      const result=await response.json().catch(()=>({}));
      if(response.status===409){setConflict(true);throw Error('This record changed since you opened it. Reload the latest version and review your decision again.');}
      if(!response.ok){if(response.status>=500)setConflict(true);throw Error((result.error||'The decision was not saved.')+(response.status>=500?' Reload its saved history before retrying.':''));}
      if(result.ok&&result.state&&Number.isInteger(result.state.version)){
        if(action==='note'||action==='reject'){setState(result.state);setDraft(current=>({...current,note:''}));}else hydrate(result.state);
        setMessage(action==='approve'?'Approved and published.':action==='withdraw'?'Publication withdrawn.':action==='reject'?'Rejected. The decision and reader draft are saved.':'Reader draft and editorial note saved. Nothing was published.');onSaved?.(action);
      }
      else{setState(null);setError('The server response did not confirm the saved decision. Reload its history before making another decision.');}
    } catch(reason) {if(!receivedResponse)setConflict(true);setError(!receivedResponse?'The decision could not be confirmed. Reload its history before retrying.':reason instanceof Error?reason.message:'The decision could not be confirmed. Reload its history before retrying.');}
    finally {setBusy(false);}
  }

  return <details className="aq-editorial-review" onToggle={event=>{if(event.target===event.currentTarget)setOpen(event.currentTarget.open);}}>
    <summary>Editorial decision and history</summary>
    {open&&<>
      <p>Approval publishes the text below to the reader site. Inspect the original source and collected evidence first. Notes and decisions are saved with a versioned history.</p>
      {busy&&<p role="status">Saving or loading editorial history…</p>}{!state&&error&&<p ref={feedbackRef} tabIndex={-1} role="alert">{error}</p>}
      <button type="button" disabled={busy} onClick={()=>{setMessage('');setReload(value=>value+1);}}>Reload saved version</button>
      {state&&<>
        <p className="aq-caption">Saved version {state.version} · Publication status: {state.entry?.status??'Unpublished'}</p>
        {!state.canApprove&&<p className="aq-editorial-blocker"><strong>Publication blocked:</strong> {state.approvalBlocker||'Available evidence is insufficient.'} You can still record a note or reject the item.</p>}
        <fieldset disabled={busy||conflict}><legend>Reader-facing content — required for publication</legend>
          <p>Complete the summary and check the quote, usefulness and coverage before publishing. News is for reporting on a development or past conference; Event is for a future attendance opportunity and requires a verified time.</p>
          <label>Title<input aria-required="true" value={draft.title} maxLength={300} onChange={event=>field('title',event.target.value)}/></label>
          <label>Reader summary<textarea aria-required="true" rows={3} value={draft.summary} maxLength={2000} onChange={event=>field('summary',event.target.value)}/></label>
          <label>Exact AI quote from collected evidence<textarea aria-required="true" rows={3} value={draft.aiQuote} maxLength={1000} onChange={event=>field('aiQuote',event.target.value)}/></label>
          <label>Why this is useful to readers<textarea aria-required="true" rows={3} value={draft.usefulness} maxLength={2000} onChange={event=>field('usefulness',event.target.value)}/></label>
          {suggestedUsefulness&&<p className="aq-caption">The assessment’s local context is a starting suggestion. Verify and edit it for readers; it does not establish an impact by itself.</p>}
          <label>Content type<select value={draft.kind} onChange={event=>field('kind',event.target.value)}>{kinds.map(kind=><option key={kind} value={kind}>{kind[0].toUpperCase()+kind.slice(1)}</option>)}</select></label>
          <fieldset><legend>Coverage — required; choose only what the source supports</legend><div className="aq-coverage-options">{coverageOptions.map(town=><label key={town}><input type="checkbox" checked={draft.towns.includes(town)} onChange={event=>field('towns',event.target.checked?[...draft.towns,town]:draft.towns.filter(value=>value!==town))}/>{town}</label>)}</div></fieldset>
          {draft.kind==='event'&&<div className="aq-event-time-fields">
            <p>{eventInputMode==='local'?`Times shown in ${browserZone}; verify against the source.`:'Exact timestamp mode: include Z or the source’s UTC offset. Verify against the source.'}</p>
            <label>Time entry format<select value={eventInputMode} onChange={event=>changeTimeMode(event.target.value as 'local'|'iso')}><option value="local">Date and time picker</option><option value="iso">Exact timestamp (advanced / daylight-saving ambiguity)</option></select></label>
            <label>Event starts<input aria-required="true" type={eventInputMode==='local'?'datetime-local':'text'} step="1" value={draft.startsAt} placeholder={eventInputMode==='iso'?'2026-10-08T18:00:00-04:00':undefined} onChange={event=>field('startsAt',event.target.value)}/></label>
            <label>Event ends — optional<input type={eventInputMode==='local'?'datetime-local':'text'} step="1" value={draft.endsAt} placeholder={eventInputMode==='iso'?'2026-10-08T20:00:00-04:00':undefined} onChange={event=>field('endsAt',event.target.value)}/></label>
            {startResult?.iso&&<p className="aq-caption">Rhode Island start: {rhodeIslandEventPreview(startResult.iso)}.</p>}{startResult?.error&&<p className="aq-caption">{startResult.error}</p>}
            {endResult?.iso&&<p className="aq-caption">Rhode Island end: {rhodeIslandEventPreview(endResult.iso)}.</p>}{endResult?.error&&<p className="aq-caption">{endResult.error}</p>}
          </div>}
          <label>Editorial note — required for every decision<textarea aria-required="true" rows={3} value={draft.note} maxLength={2000} onChange={event=>field('note',event.target.value)}/></label>
          <div aria-label="Publication readiness"><strong>{state.canApprove?(missingFields.length?'Before you publish':'Required fields complete — ready for your approval'):'Publication is blocked for this source record'}</strong><ul aria-label="Publication checklist">{approvalChecks.map(check=><li key={check.label}>{check.ready?'Ready':'Needed'}: {check.label}</li>)}</ul></div>
          {eventError&&<p className="aq-caption">{eventError}</p>}
          <div className="aq-editorial-actions"><button type="button" onClick={()=>save('note')}>Save draft and note</button><button type="button" disabled={!state.canApprove} onClick={()=>save('approve')}>Approve and publish</button><button type="button" onClick={()=>save('reject')}>Reject item</button>{state.entry?.status==='published'&&<button type="button" onClick={()=>save('withdraw')}>Withdraw publication</button>}</div>
          {error&&<p ref={feedbackRef} tabIndex={-1} role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
          {message&&/^(Approved and published|Publication withdrawn)/.test(message)&&<p className="aq-caption">The public feed should reflect the change within two minutes.</p>}
          <p className="aq-caption">Save draft and note keeps this text for later without publishing. Reject also preserves the draft; you can revise it and approve later.</p>
        </fieldset>
        <h4>Recent editorial history</h4>{state.history?.length?<><p className="aq-caption">Up to 10 most recent decisions. Saving a note does not resolve the assessment or publish the item.</p><ol>{state.history.map(entry=><li key={entry.version}><strong>Version {entry.version}: {entry.action}</strong> · {formatReaderDate(entry.reviewedAt)}<p>{entry.note}</p></li>)}</ol></>:<p>No editorial decisions recorded yet.</p>}
      </>}
    </>}
  </details>;
}
