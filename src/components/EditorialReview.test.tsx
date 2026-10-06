import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import EditorialReview from './EditorialReview';
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.unstubAllEnvs();});
const id='11111111-1111-4111-8111-111111111111';
const initial={version:0,canApprove:true,approvalBlocker:null,entry:null,review:null,history:[]};
const response=(data:unknown,status=200)=>({ok:status>=200&&status<300,status,json:async()=>data});
const renderReview=()=>render(<EditorialReview id={id} title="AI business workshop" aiQuote="AI business workshop"/>);
async function openReview(){fireEvent.click(screen.getByText('Editorial decision and history'));await screen.findByText(/Saved version 0/);}
function note(){fireEvent.change(screen.getByLabelText('Editorial note — required for every decision'),{target:{value:'Checked source and practical usefulness.'}});}

it('loads on demand and requires deliberate approval with explicit coverage',async()=>{
 const published={...initial,version:1,entry:{status:'published',title:'AI business workshop',summary:'Learn practical AI workflows.',aiQuote:'AI business workshop',usefulness:'Relevant training for local businesses.',kind:'program',towns:['Rhode Island']},history:[{version:1,action:'approve',note:'Checked source and practical usefulness.',reviewedAt:'2026-10-05T16:00:00Z'}]};
 const fetcher=vi.fn().mockResolvedValueOnce(response(initial)).mockResolvedValueOnce(response({ok:true,state:published}));vi.stubGlobal('fetch',fetcher);
 renderReview();expect(fetcher).not.toHaveBeenCalled();await openReview();expect(fetcher).toHaveBeenCalledTimes(1);
 fireEvent.click(screen.getByRole('button',{name:'Approve and publish'}));expect(await screen.findByRole('alert')).toHaveTextContent('Editorial note');expect(screen.getByRole('alert')).toHaveFocus();
 note();fireEvent.click(screen.getByRole('button',{name:'Approve and publish'}));expect(await screen.findByRole('alert')).toHaveTextContent('Reader summary; Why this is useful to readers; Coverage');expect(fetcher).toHaveBeenCalledTimes(1);
 fireEvent.change(screen.getByLabelText('Reader summary'),{target:{value:'Learn practical AI workflows.'}});
 fireEvent.change(screen.getByLabelText('Why this is useful to readers'),{target:{value:'Relevant training for local businesses.'}});
 fireEvent.change(screen.getByLabelText('Content type'),{target:{value:'program'}});
 expect(screen.getByRole('checkbox',{name:'Rhode Island'})).not.toBeChecked();
 fireEvent.click(screen.getByRole('checkbox',{name:'Rhode Island'}));fireEvent.click(screen.getByRole('button',{name:'Approve and publish'}));
 expect(await screen.findByText('Approved and published.')).toBeInTheDocument();expect(fetcher).toHaveBeenCalledTimes(2);
 const body=JSON.parse(fetcher.mock.calls[1][1].body);expect(body).toMatchObject({id,expectedVersion:0,action:'approve',kind:'program',towns:['Rhode Island']});
 expect(screen.getByText('Version 1: approve')).toBeInTheDocument();expect(screen.getByRole('button',{name:'Withdraw publication'})).toBeInTheDocument();
});

it('blocks whole-page publication while allowing a versioned note without publishing',async()=>{
 const blocked={...initial,canApprove:false,approvalBlocker:'This is a whole-page snapshot, not an individual article.'};
 const fetcher=vi.fn().mockResolvedValueOnce(response(blocked)).mockResolvedValueOnce(response({ok:true,state:{...blocked,version:1,history:[{version:1,action:'note',note:'Checked source and practical usefulness.',reviewedAt:'2026-10-05T16:00:00Z'}]}}));vi.stubGlobal('fetch',fetcher);
 renderReview();await openReview();expect(screen.getByRole('button',{name:'Approve and publish'})).toBeDisabled();expect(screen.getByText(/whole-page snapshot/)).toBeInTheDocument();
 note();fireEvent.click(screen.getByRole('button',{name:'Save draft and note'}));expect(await screen.findByText('Reader draft and editorial note saved. Nothing was published.')).toBeInTheDocument();
 expect(JSON.parse(fetcher.mock.calls[1][1].body)).toMatchObject({id,expectedVersion:0,action:'note',note:'Checked source and practical usefulness.',title:'AI business workshop',summary:'',kind:'news',towns:[]});
 expect(screen.queryByText('Approved and published.')).not.toBeInTheDocument();
});

it('requires reloading after a version conflict and never retries a decision automatically',async()=>{
 const fetcher=vi.fn().mockResolvedValueOnce(response(initial)).mockResolvedValueOnce(response({ok:false,error:'Version changed'},409)).mockResolvedValueOnce(response({...initial,version:2}));vi.stubGlobal('fetch',fetcher);
 renderReview();await openReview();note();fireEvent.click(screen.getByRole('button',{name:'Reject item'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('changed since you opened it');expect(screen.getByRole('button',{name:'Reject item'})).toBeDisabled();expect(fetcher).toHaveBeenCalledTimes(2);
 fireEvent.click(screen.getByRole('button',{name:'Reload saved version'}));await screen.findByText(/Saved version 2/);expect(fetcher).toHaveBeenCalledTimes(3);expect(fetcher.mock.calls.filter(call=>call[1]?.method==='POST')).toHaveLength(1);
});

it('does not display success or discard the note when the server cannot confirm a decision',async()=>{
 const fetcher=vi.fn().mockResolvedValueOnce(response(initial)).mockResolvedValueOnce(response({ok:false,error:'Decision could not be saved.'},503));vi.stubGlobal('fetch',fetcher);
 renderReview();await openReview();note();fireEvent.click(screen.getByRole('button',{name:'Reject item'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Decision could not be saved.');await waitFor(()=>expect(screen.getByRole('button',{name:'Reject item'})).toBeDisabled());
 expect(screen.getByRole('alert')).toHaveFocus();
 expect(screen.getByLabelText('Editorial note — required for every decision')).toHaveValue('Checked source and practical usefulness.');expect(screen.queryByText('Rejected. The decision is recorded.')).not.toBeInTheDocument();
});

it('saves an unfinished reader draft with a note and restores it before approval',async()=>{
 let saved=initial as Record<string,unknown>;
 const writes:Record<string,unknown>[]=[];
 const fetcher=vi.fn(async(_url:string,options?:RequestInit)=>{
  if(options?.method==='POST'){
   const payload=JSON.parse(String(options.body));writes.push(payload);
   saved={...initial,version:writes.length,review:payload,entry:payload.action==='approve'?{...payload,status:'published'}:null};
   return response({ok:true,state:saved});
  }
  return response(saved);
 });vi.stubGlobal('fetch',fetcher);
 renderReview();await openReview();
 fireEvent.change(screen.getByLabelText('Reader summary'),{target:{value:'A practical AI workshop for businesses.'}});
 fireEvent.change(screen.getByLabelText('Why this is useful to readers'),{target:{value:'Newport businesses can explore the workshop.'}});
 fireEvent.click(screen.getByRole('checkbox',{name:'Newport'}));note();
 fireEvent.click(screen.getByRole('button',{name:'Save draft and note'}));await screen.findByText(/Reader draft and editorial note saved/);
 expect(writes[0]).toMatchObject({action:'note',summary:'A practical AI workshop for businesses.',usefulness:'Newport businesses can explore the workshop.',kind:'news',towns:['Newport']});
 expect(screen.getByLabelText('Reader summary')).toHaveValue('A practical AI workshop for businesses.');
 fireEvent.click(screen.getByRole('button',{name:'Reload saved version'}));await screen.findByText(/Saved version 1/);
 expect(screen.getByLabelText('Reader summary')).toHaveValue('A practical AI workshop for businesses.');expect(screen.getByRole('checkbox',{name:'Newport'})).toBeChecked();
 note();fireEvent.click(screen.getByRole('button',{name:'Approve and publish'}));await screen.findByText('Approved and published.');
 expect(writes[1]).toMatchObject({expectedVersion:1,action:'approve',summary:'A practical AI workshop for businesses.',kind:'news',towns:['Newport']});
});

it('retains a prepared draft after rejection and can approve it with the new version',async()=>{
 const prepared={...initial,entry:{status:'unpublished',title:'Newport AI conference',summary:'Researchers discussed AI wargaming.',aiQuote:'AI wargaming',usefulness:'Newport hosts the research discussion.',kind:'news',towns:['Newport']}};
 const rejected={...initial,version:1,entry:{status:'rejected',title:'Newport AI conference',summary:null,kind:'other',towns:[]},history:[{version:1,action:'reject',note:'Checked source and practical usefulness.',reviewedAt:'2026-10-06T16:00:00Z'}]};
 const fetcher=vi.fn().mockResolvedValueOnce(response(prepared)).mockResolvedValueOnce(response({ok:true,state:rejected})).mockResolvedValueOnce(response({ok:true,state:{...prepared,version:2,entry:{...prepared.entry,status:'published'}}}));vi.stubGlobal('fetch',fetcher);
 renderReview();await openReview();note();fireEvent.click(screen.getByRole('button',{name:'Reject item'}));await screen.findByText('Rejected. The decision and reader draft are saved.');
 expect(screen.getByLabelText('Reader summary')).toHaveValue('Researchers discussed AI wargaming.');expect(screen.getByLabelText('Content type')).toHaveValue('news');expect(screen.getByRole('checkbox',{name:'Newport'})).toBeChecked();
 note();fireEvent.click(screen.getByRole('button',{name:'Approve and publish'}));await screen.findByText('Approved and published.');
 expect(JSON.parse(fetcher.mock.calls[2][1].body)).toMatchObject({action:'approve',expectedVersion:1,summary:'Researchers discussed AI wargaming.',towns:['Newport']});
});

it('restores a structured note draft over a rejected entry without guessing geography',async()=>{
 const rejected={...initial,version:2,entry:{status:'rejected',title:'Newport AI conference',summary:null,kind:'other',towns:[]},review:{action:'note',title:'Reviewed AI conference',summary:'Researchers discussed AI wargaming.',aiQuote:'AI wargaming',usefulness:'Newport hosts the research discussion.',kind:'news',towns:['Newport']}};
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response(rejected)));
 renderReview();fireEvent.click(screen.getByText('Editorial decision and history'));await screen.findByText(/Saved version 2/);
 expect(screen.getByLabelText('Title')).toHaveValue('Reviewed AI conference');expect(screen.getByLabelText('Reader summary')).toHaveValue('Researchers discussed AI wargaming.');expect(screen.getByRole('checkbox',{name:'Newport'})).toBeChecked();expect(screen.getByRole('checkbox',{name:'Rhode Island'})).not.toBeChecked();
});

it('keeps publication text when an older note-only record has no draft fields',async()=>{
 const saved={...initial,version:2,entry:{status:'published',title:'Saved title',summary:'Saved summary',aiQuote:'AI evidence',usefulness:'Saved usefulness',kind:'program',towns:['Rhode Island']},review:{action:'note',note:'Older note only'}};
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response(saved)));
 renderReview();fireEvent.click(screen.getByText('Editorial decision and history'));await screen.findByText(/Saved version 2/);
 expect(screen.getByLabelText('Reader summary')).toHaveValue('Saved summary');expect(screen.getByLabelText('Content type')).toHaveValue('program');expect(screen.getByRole('checkbox',{name:'Rhode Island'})).toBeChecked();
});

it('shows backend quote validation beside the decision buttons, focuses it and retains the draft',async()=>{
 const prepared={...initial,entry:{status:'unpublished',title:'Newport AI conference',summary:'Researchers discussed AI wargaming.',aiQuote:'AI wargaming',usefulness:'Newport hosts the research discussion.',kind:'news',towns:['Newport']}};
 const fetcher=vi.fn().mockResolvedValueOnce(response(prepared)).mockResolvedValueOnce(response({ok:false,error:'The AI quote must match the collected evidence exactly and explicitly establish AI relevance'},422));vi.stubGlobal('fetch',fetcher);
 renderReview();await openReview();note();fireEvent.click(screen.getByRole('button',{name:'Approve and publish'}));
 const alert=await screen.findByRole('alert');expect(alert).toHaveTextContent('The AI quote must match');expect(alert).toHaveFocus();
 expect(alert.previousElementSibling).toContainElement(screen.getByRole('button',{name:'Approve and publish'}));
 expect(screen.getByLabelText('Reader summary')).toHaveValue('Researchers discussed AI wargaming.');expect(screen.getByRole('button',{name:'Approve and publish'})).toBeEnabled();expect(fetcher).toHaveBeenCalledTimes(2);
});

it('uses supplied context as an editable suggestion while keeping summary and coverage deliberate',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response(initial)));
 render(<EditorialReview id={id} title="Newport AI conference" aiQuote="AI wargaming" suggestedUsefulness="The source describes research in Newport."/>);await openReview();
 expect(screen.getByLabelText('Why this is useful to readers')).toHaveValue('The source describes research in Newport.');expect(screen.getByLabelText('Content type')).toHaveValue('news');expect(screen.getByLabelText('Reader summary')).toHaveValue('');expect(screen.getByRole('checkbox',{name:'Newport'})).not.toBeChecked();
 expect(screen.getByRole('list',{name:'Publication checklist'})).toHaveTextContent('Needed: Reader summary');
 expect(screen.getByLabelText('Reader summary')).toHaveAttribute('aria-required','true');
});

it('restores an unfinished event draft without inventing a valid event time',async()=>{
 const saved={...initial,version:1,review:{action:'note',title:'AI workshop',summary:'A workshop.',aiQuote:'AI workshop',usefulness:'Useful practice.',kind:'event',towns:['Newport'],startsAt:'2099-06-10T18:00+bad',endsAt:''}};
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response(saved)));
 renderReview();fireEvent.click(screen.getByText('Editorial decision and history'));await screen.findByText(/Saved version 1/);
 expect(screen.getByLabelText('Event starts')).toHaveAttribute('type','text');expect(screen.getByLabelText('Event starts')).toHaveValue('2099-06-10T18:00+bad');
 note();fireEvent.click(screen.getByRole('button',{name:'Approve and publish'}));expect(await screen.findByRole('alert')).toHaveTextContent('explicit UTC offset');
});
it('hydrates event pickers in the browser timezone and sends a zoned ISO instant',async()=>{
 vi.stubEnv('TZ','UTC');
 const event={...initial,entry:{status:'unpublished',title:'AI business workshop',summary:'Learn practical AI workflows.',aiQuote:'AI business workshop',usefulness:'Relevant training for local businesses.',kind:'event',towns:['Rhode Island'],startsAt:'2099-06-10T22:30:00Z',endsAt:null}};
 const fetcher=vi.fn().mockResolvedValueOnce(response(event)).mockResolvedValueOnce(response({ok:true,state:{...event,version:1}}));vi.stubGlobal('fetch',fetcher);
 renderReview();await openReview();expect(screen.getByLabelText('Event starts')).toHaveAttribute('type','datetime-local');expect(screen.getByLabelText('Event starts')).toHaveValue('2099-06-10T22:30');expect(screen.getByText(/Times shown in UTC/)).toBeInTheDocument();
 expect(screen.getByText(/Rhode Island start:/)).toHaveTextContent('6:30 PM');
 note();fireEvent.click(screen.getByRole('button',{name:'Approve and publish'}));await screen.findByText('Approved and published.');
 expect(JSON.parse(fetcher.mock.calls[1][1].body)).toMatchObject({startsAt:'2099-06-10T22:30:00.000Z',endsAt:null});
});
it('keeps an event with no start date unsaved and offers explicit-offset entry',async()=>{
 const event={...initial,entry:{status:'unpublished',title:'AI business workshop',summary:'Learn practical AI workflows.',aiQuote:'AI business workshop',usefulness:'Relevant training for local businesses.',kind:'event',towns:['Rhode Island'],startsAt:null,endsAt:null}};
 const fetcher=vi.fn().mockResolvedValue(response(event));vi.stubGlobal('fetch',fetcher);
 renderReview();await openReview();note();fireEvent.click(screen.getByRole('button',{name:'Approve and publish'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Choose the event start date and time');expect(fetcher).toHaveBeenCalledTimes(1);
 fireEvent.change(screen.getByLabelText('Time entry format'),{target:{value:'iso'}});expect(screen.getByLabelText('Event starts')).toHaveAttribute('type','text');
 fireEvent.change(screen.getByLabelText('Event starts'),{target:{value:'2099-01-01T12:00'}});fireEvent.click(screen.getByRole('button',{name:'Approve and publish'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('explicit UTC offset');expect(fetcher).toHaveBeenCalledTimes(1);
});
