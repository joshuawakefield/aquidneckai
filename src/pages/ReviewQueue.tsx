import {useEffect,useState} from 'react';
import EvidenceText from '@/components/EvidenceText';
import EditorialReview from '@/components/EditorialReview';
import {formatReaderDate} from '@/lib/date-format';
export type ReviewItem={id:string;title:string;url:string;source:string;date:string|null;excerpt?:string;decision:string;issue:string|null;reason:string;aiEvidence:string;localEvidence:string;modelDecision:string|null;modelReason:string|null;status:string;destination:string|null;editorialAction?:'note'|'approve'|'reject'|'withdraw'};
function Evidence({id}:{id:string}){
 const [open,setOpen]=useState(false),[excerpt,setExcerpt]=useState<string>(),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>{
  if(!open||excerpt!==undefined)return;
  const controller=new AbortController();setError('');
  fetch('/api/aqai/evidence?id='+encodeURIComponent(id),{signal:controller.signal}).then(async r=>{if(!r.ok)throw Error();return r.json();})
   .then(data=>{if(!controller.signal.aborted)setExcerpt(data.excerpt);})
   .catch(()=>{if(!controller.signal.aborted)setError('Evidence could not be loaded.');});
  return()=>controller.abort();
 },[id,open,excerpt,attempt]);
 return <details onToggle={e=>setOpen(e.currentTarget.open)}><summary>Collected source excerpt</summary>{open&&<>
  {error?<p role="alert">{error} <button onClick={()=>setAttempt(n=>n+1)}>Retry evidence</button></p>:
   excerpt===undefined?<p>Loading evidence…</p>:<EvidenceText text={excerpt||'No description supplied by this feed.'} limit={700}/>}
 </>}</details>;
}
export default function ReviewQueue({observations=0}:{observations?:number}){
 const [open,setOpen]=useState(false),[filter,setFilter]=useState('candidate'),[draftQuery,setDraftQuery]=useState(''),[query,setQuery]=useState('');
 const [offset,setOffset]=useState(0),[items,setItems]=useState<ReviewItem[]>([]),[total,setTotal]=useState(0),[error,setError]=useState(''),[busy,setBusy]=useState(false),[refresh,setRefresh]=useState(0);
 useEffect(()=>{
  if(!open)return;
  const controller=new AbortController();setBusy(true);setError('');setItems([]);
  const params=new URLSearchParams({decision:filter,q:query,offset:String(offset)});
  fetch('/api/aqai/review?'+params,{signal:controller.signal}).then(async r=>{if(!r.ok)throw Error();return r.json();})
   .then(data=>{if(!controller.signal.aborted){setItems(data.items);setTotal(data.total);}})
   .catch(()=>{if(!controller.signal.aborted)setError('Review records could not be loaded. Please refresh.');})
   .finally(()=>{if(!controller.signal.aborted)setBusy(false);});
  return()=>controller.abort();
 },[open,filter,query,offset,refresh]);
 return <details className="aq-note" id="assessment-review" onToggle={e=>{if(e.target===e.currentTarget)setOpen(e.currentTarget.open);}}><summary style={{cursor:'pointer',fontWeight:700}}>Inspect collected articles and assessment decisions ({observations})</summary>
 {open&&<><p>This private view includes excluded articles and incomplete assessments. Highlighted words help you scan evidence; they do not establish relevance. A review label does not mean an article was approved. Opening it does not publish it.</p>
 <label>Show <select aria-label="Assessment filter" value={filter} onChange={e=>{setFilter(e.target.value);setOffset(0);}}>{[['candidate','Candidates to consider'],['needs_review','Needs human review'],['pending','Awaiting assessment'],['reject','Excluded'],['all','All collected items']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
 <form onSubmit={e=>{e.preventDefault();setQuery(draftQuery.trim());setOffset(0);}}><input aria-label="Search collected articles" maxLength={200} placeholder="Search title, source or excerpt" value={draftQuery} onChange={e=>setDraftQuery(e.target.value)}/><button type="submit">Search</button></form>
 <button onClick={()=>setRefresh(n=>n+1)} disabled={busy}>Refresh review</button>
 {error&&<p role="alert">{error}</p>}{busy?<p>Loading review records…</p>:<p>{total} matching records. Showing {items.length?offset+1:0}–{offset+items.length}. Revisions or overlapping feeds may contain the same article.</p>}
 {items.map(i=><article className="aq-item" key={i.id}><h3><a href={i.url} target="_blank" rel="noreferrer">{i.title} ↗</a></h3><p>{i.source} · {i.date?`Source date: ${formatReaderDate(i.date)}`:'Source date unavailable · Page snapshot or undated item'}</p>
 {i.editorialAction&&i.editorialAction!=='note'?<p><strong>Editorial decision recorded: {i.editorialAction==='approve'?'Published':i.editorialAction==='withdraw'?'Publication withdrawn':'Rejected'}.</strong> The saved history below is current.</p>:<><p><strong>{i.decision==='needs_review'?'Unresolved · Needs human review':i.decision==='pending'?'Awaiting assessment':i.decision==='reject'?'Excluded':i.decision==='candidate'?'Candidate — publication checked separately':'Unresolved assessment'}</strong>: {i.reason||'No completed assessment is available.'}</p>
 {i.issue&&<p>Assessment issue: {i.issue.replace(/_/g,' ')}. No automatic paid retry.</p>}</>}
 {i.editorialAction&&<p>{i.editorialAction==='note'?'Editorial note saved; the assessment is unchanged. ':''}<button onClick={()=>setRefresh(n=>n+1)}>Refresh review after decision</button> to update queue membership and counts.</p>}
 {i.aiEvidence&&<div><strong>AI evidence</strong><EvidenceText text={i.aiEvidence}/></div>}{i.localEvidence&&<div><strong>Relevance and source context</strong><EvidenceText text={i.localEvidence}/></div>}
 {i.modelDecision&&i.modelDecision!==i.decision&&<p>Model originally said {i.modelDecision}: {i.modelReason}. The evidence check withheld that decision.</p>}
 <Evidence id={i.id}/><EditorialReview id={i.id} title={i.title} aiQuote={i.aiEvidence} onSaved={action=>setItems(current=>current.map(item=>item.id===i.id?{...item,editorialAction:action}:item))}/></article>)}
 <p><button disabled={busy||offset===0} onClick={()=>setOffset(n=>Math.max(0,n-25))}>Previous page</button>{' '}
 <button disabled={busy||offset+25>=total} onClick={()=>setOffset(n=>n+25)}>Next page</button></p>
 </>}
 </details>;
}
