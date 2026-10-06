import {render,screen,fireEvent,cleanup,within,act} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import IndexPreview from './IndexPreview';
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.useRealTimers();});
it('renders live archive data and filters by town',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({fetchedAt:new Date().toISOString(),observations:66,classified:66,classificationPending:0,sources:[],items:[{id:'1',title:'Historical AI workshop',url:'https://example.org',source:'Salve',towns:['Newport'],date:'2023-07-19',destination:'archive_review',aiEvidence:'AI workshop',localEvidence:'Salve, Newport'}]})}));
 render(<IndexPreview/>);
 expect(await screen.findByText('Historical AI workshop')).toBeInTheDocument();
 expect(screen.getByText(/66 collected items/)).toBeInTheDocument();
 expect(screen.getByText('Source date: Jul 19, 2023')).toBeInTheDocument();
 expect(screen.getByText('Unpublished · Needs verification')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Middletown'}));
 expect(screen.queryByText('Historical AI workshop')).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Newport'}));
 expect(screen.getByText('Historical AI workshop')).toBeInTheDocument();
});
it('separates expired events and keeps unknown dates out of current event claims',async()=>{
 const base={url:'https://example.org',source:'Salve',towns:['Newport'],date:'2026-01-01',destination:'current_review',aiEvidence:'AI workshop',localEvidence:'Newport',status:'published',kind:'event'};
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({fetchedAt:new Date().toISOString(),observations:3,classified:3,classificationPending:0,reviewRequired:2,sources:[],items:[{...base,id:'past',title:'Expired workshop',startsAt:'2020-01-01T12:00:00Z'},{...base,id:'future',title:'Future workshop',startsAt:'2099-01-01T12:00:00Z'},{...base,id:'unknown',title:'Undated workshop',startsAt:null}]})}));
 render(<IndexPreview/>);
 expect(await screen.findByText('Expired workshop')).toBeInTheDocument();
 expect(within(screen.getByRole('region',{name:'Past events and archive resources'})).getByText('Expired workshop')).toBeInTheDocument();
 expect(within(screen.getByRole('region',{name:'AI candidates'})).getByText('Future workshop')).toBeInTheDocument();
 expect(within(screen.getByRole('region',{name:'Date needs checking'})).getByText('Undated workshop')).toBeInTheDocument();
 expect(screen.getByText('Event date not confirmed')).toBeInTheDocument();
 expect(screen.getByText(/0 awaiting assessment · 2 unresolved review items/)).toBeInTheDocument();
 expect(screen.getByRole('link',{name:'Reader homepage'})).toHaveAttribute('href','/');
 expect(screen.getByText(/Source coverage and collection diagnostics/).closest('details')).not.toHaveAttribute('open');
});
it('shows database failure rather than a fabricated static fallback',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false}));render(<IndexPreview/>);
 expect(await screen.findByRole('alert')).toHaveTextContent('Database refresh failed');
 expect(screen.queryByText('Historical AI workshop')).not.toBeInTheDocument();
});
it('separates requested sources from sources eligible to collect',async()=>{
 const base={url:'https://example.org',towns:['Newport'],kind:'news',checkedAt:null,itemCount:0,enabled:true};
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({fetchedAt:new Date().toISOString(),observations:0,classified:0,classificationPending:0,items:[],sources:[{...base,id:'ready',name:'Ready source',status:'parsed',collecting:true},{...base,id:'waiting',name:'Waiting source',status:'imported_unverified',collecting:false}]})}));
 render(<IndexPreview/>);
 expect(await screen.findByText(/1 collecting automatically · 1 awaiting setup/)).toBeInTheDocument();
 expect(screen.getByText(/Requested · Awaiting setup/)).toBeInTheDocument();
});

it.each([
 ['fresh',0.4,0.6,0,'Within budget at last check'],
 ['near limit',0.9,0.1,0,'Near limit'],
 ['stopped',0.981,0.019,0,'Stopped at budget preflight'],
 ['stop boundary',0.98,0.02,0,'Near limit'],
 ['stale',0.4,0.6,16,'Usage stale'],
 ['stale stopped',0.99,0.01,16,'Usage stale'],
 ['future',0.4,0.6,-1,'Usage unavailable'],
 ['missing',null,null,0,'Usage unavailable'],
 ['inconsistent',0.4,1,0,'Usage unavailable'],
])('shows %s budget with timestamp and safe recovery',async(_name,usedUsd,remainingUsd,age,state)=>{
 const checkedAt=new Date(Date.now()-age*60000).toISOString();
 const fetch=vi.fn().mockResolvedValue({ok:true,json:async()=>({inferenceBudget:{checkedAt,usedUsd,remainingUsd},fetchedAt:new Date().toISOString(),observations:12,classified:10,classificationPending:2,reviewRequired:3,sources:[],items:[]})});
 vi.stubGlobal('fetch',fetch);render(<IndexPreview/>);
 expect(await screen.findByText('3 unresolved review items',{selector:'strong'})).toBeInTheDocument();
 expect(screen.getByText(state,{selector:'strong'})).toBeInTheDocument();
 expect(screen.getByText(/Policy: \$1 non-resetting key cap/)).toBeInTheDocument();
 expect(screen.getByText(/reconcile saved responses first/)).toBeInTheDocument();
 expect(screen.getByText(/Invalid evidence and uncertain assessments/)).toBeInTheDocument();
 expect(screen.getByRole('link',{name:'Go to assessment review'})).toHaveAttribute('href','#assessment-review');
 if(state==='Usage unavailable')expect(screen.getByText(/unknown, not zero/)).toBeInTheDocument();
 else expect(screen.getByText(checkedAt,{selector:'time'})).toBeInTheDocument();
 expect(fetch).toHaveBeenCalledTimes(1);expect(fetch.mock.calls[0][0]).toBe('/api/aqai/preview');
});

it('keeps unknown counts on unavailable overview and aborts interrupted refresh on unmount',async()=>{
 const fetch=vi.fn().mockImplementation(()=>new Promise(()=>{}));vi.stubGlobal('fetch',fetch);
 const view=render(<IndexPreview/>);
 expect(screen.getByText('Unknown unresolved review items')).toBeInTheDocument();
 expect(screen.getByText('Usage unavailable',{selector:'strong'})).toBeInTheDocument();
 const signal=fetch.mock.calls[0][1].signal;view.unmount();expect(signal.aborted).toBe(true);
 render(<IndexPreview/>);expect(fetch).toHaveBeenCalledTimes(2);
});


it('ages usage without provider requests and labels cached counts after failed refresh',async()=>{
 vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-06T12:00:00Z'));
 const data={inferenceBudget:{checkedAt:new Date().toISOString(),usedUsd:0.4,remainingUsd:0.6},fetchedAt:new Date().toISOString(),observations:12,classified:10,classificationPending:2,reviewRequired:3,sources:[],items:[]};
 const fetch=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>data}).mockRejectedValue(Error('offline'));
 vi.stubGlobal('fetch',fetch);render(<IndexPreview/>);
 await act(async()=>{});
 expect(screen.getByText('Within budget at last check',{selector:'strong'})).toBeInTheDocument();
 await act(async()=>{await vi.advanceTimersByTimeAsync(300000);});
 expect(screen.getByText('Usage stale',{selector:'strong'})).toBeInTheDocument();
 expect(screen.getByText(/counts may be stale/)).toBeInTheDocument();
 await act(async()=>{await vi.advanceTimersByTimeAsync(11*60000);});
 expect(screen.getByText('Usage stale',{selector:'strong'})).toBeInTheDocument();
 expect(fetch.mock.calls.every(([url])=>url==='/api/aqai/preview')).toBe(true);
});


it('accepts a fresh snapshot arriving after mount and ages it without fetching',async()=>{
 vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-06T12:00:00Z'));
 let respond:(value:unknown)=>void=()=>{};
 const fetch=vi.fn().mockImplementation(()=>new Promise(resolve=>{respond=resolve;}));vi.stubGlobal('fetch',fetch);
 render(<IndexPreview/>);
 await act(async()=>{await vi.advanceTimersByTimeAsync(1000);respond({ok:true,json:async()=>({inferenceBudget:{checkedAt:new Date().toISOString(),usedUsd:0.4,remainingUsd:0.6},fetchedAt:new Date().toISOString(),observations:0,classified:0,classificationPending:0,reviewRequired:0,sources:[],items:[]})});});
 expect(screen.getByText('Within budget at last check',{selector:'strong'})).toBeInTheDocument();
 // Hidden tab: existing overview poll skips reads; display timer still ages the snapshot.
 const hidden=vi.spyOn(document,'hidden','get').mockReturnValue(true);
 await act(async()=>{await vi.advanceTimersByTimeAsync(16*60000);});
 expect(screen.getByText('Usage stale',{selector:'strong'})).toBeInTheDocument();
 expect(fetch).toHaveBeenCalledTimes(1);hidden.mockRestore();
});
