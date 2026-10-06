import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
import {it,expect,afterEach,vi} from 'vitest';
import ReviewQueue from './ReviewQueue';
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
const item={id:'11111111-1111-4111-8111-111111111111',title:'Uncertain technology news',url:'https://example.org',source:'Local paper',date:null,decision:'needs_review',issue:'invalid_or_missing_decision',reason:'Uncertain',aiEvidence:'',localEvidence:'Newport',modelDecision:'reject',modelReason:'No AI evidence',status:'completed',destination:'excluded'};
it('loads the queue only when opened and evidence only when expanded',async()=>{
 const fetcher=vi.fn(async(url:string)=>({ok:true,json:async()=>url.includes('/evidence')?{excerpt:'One requested excerpt'}:{items:[item],total:1}}));vi.stubGlobal('fetch',fetcher);
 render(<ReviewQueue observations={10000}/>);expect(fetcher).not.toHaveBeenCalled();
 fireEvent.click(screen.getByText(/Inspect collected articles/));
 expect(await screen.findByText('Uncertain technology news ↗')).toBeInTheDocument();expect(fetcher).toHaveBeenCalledTimes(1);
 expect(screen.queryByText('One requested excerpt')).not.toBeInTheDocument();
 fireEvent.click(screen.getByText('Collected source excerpt'));
 expect(await screen.findByText('One requested excerpt')).toBeInTheDocument();expect(fetcher).toHaveBeenCalledTimes(2);
 fireEvent.click(screen.getByText('Collected source excerpt'));fireEvent.click(screen.getByText('Collected source excerpt'));
 await waitFor(()=>expect(fetcher).toHaveBeenCalledTimes(2));
 expect(screen.queryByRole('button',{name:/publish/i})).not.toBeInTheDocument();
 expect(screen.getByText('Unresolved · Needs human review')).toBeInTheDocument();
 expect(screen.getByText(/invalid or missing decision. No automatic paid retry/)).toBeInTheDocument();
});
it('filters and paginates on the server, with submitted rather than per-keystroke search',async()=>{
 const fetcher=vi.fn(async(_url:string)=>({ok:true,json:async()=>({items:[item],total:60})}));vi.stubGlobal('fetch',fetcher);
 render(<ReviewQueue/>);fireEvent.click(screen.getByText(/Inspect collected articles/));await screen.findByText('Uncertain technology news ↗');
 fireEvent.change(screen.getByLabelText('Search collected articles'),{target:{value:'needle'}});expect(fetcher).toHaveBeenCalledTimes(1);
 fireEvent.click(screen.getByRole('button',{name:'Search'}));await waitFor(()=>expect(fetcher.mock.calls.length).toBe(2));
 expect(String(fetcher.mock.calls[1][0])).toContain('q=needle');await screen.findByText('Uncertain technology news ↗');
 fireEvent.click(screen.getByRole('button',{name:'Next page'}));await waitFor(()=>expect(fetcher.mock.calls.length).toBe(3));expect(String(fetcher.mock.calls[2][0])).toContain('offset=25');
 await screen.findByText('Uncertain technology news ↗');fireEvent.change(screen.getByLabelText('Assessment filter'),{target:{value:'reject'}});
 await waitFor(()=>expect(fetcher.mock.calls.length).toBe(4));expect(String(fetcher.mock.calls[3][0])).toContain('decision=reject');expect(String(fetcher.mock.calls[3][0])).toContain('offset=0');
});
it('replaces the stale assessment label after a saved decision and refreshes the queue on request',async()=>{
 let rejected=false;
 const fetcher=vi.fn(async(url:string,options?:RequestInit)=>({ok:true,status:200,json:async()=>{
  if(options?.method==='POST'){rejected=true;return {ok:true,state:{version:1,canApprove:true,entry:null,history:[{version:1,action:'reject',note:'Checked and rejected.',reviewedAt:'2026-10-05T16:00:00Z'}]}};}
  if(url.includes('/editorial'))return {version:0,canApprove:true,entry:null,history:[]};
  return {items:rejected?[]:[{...item,decision:'candidate',issue:null}],total:rejected?0:1};
 }}));vi.stubGlobal('fetch',fetcher);
 render(<ReviewQueue/>);fireEvent.click(screen.getByText(/Inspect collected articles/));await screen.findByText('Uncertain technology news ↗');
 expect(String(fetcher.mock.calls[0][0])).toContain('decision=candidate');
 fireEvent.click(screen.getByText('Editorial decision and history'));await screen.findByText(/Saved version 0/);
 fireEvent.change(screen.getByLabelText('Editorial note — required for every decision'),{target:{value:'Checked and rejected.'}});fireEvent.click(screen.getByRole('button',{name:'Reject item'}));
 expect(await screen.findByText('Editorial decision recorded: Rejected.')).toBeInTheDocument();expect(screen.queryByText('Candidate — publication checked separately')).not.toBeInTheDocument();expect(fetcher).toHaveBeenCalledTimes(3);
 fireEvent.click(screen.getByRole('button',{name:'Refresh review after decision'}));await waitFor(()=>expect(screen.queryByText('Uncertain technology news ↗')).not.toBeInTheDocument());
 expect(await screen.findByText(/0 matching records/)).toBeInTheDocument();
});
