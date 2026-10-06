import {render,screen,fireEvent,cleanup,within} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import IndexPreview from './IndexPreview';
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
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
