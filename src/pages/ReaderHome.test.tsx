import {cleanup,fireEvent,render,screen,within} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import ReaderHome from './ReaderHome';
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
const feed=(data={items:[],pastEvents:[]})=>vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>data}));
it('offers useful resources even when no current event is published',async()=>{
 feed();render(<ReaderHome/>);
 expect(await screen.findByText('No current listings published here yet.')).toBeInTheDocument();
 expect(screen.getByRole('link',{name:/Apply for no-cost AI training/})).toHaveAttribute('href','https://ai.ri.gov/free-resources/grow-google-rhode-island');
 expect(screen.getByText(/Licenses are limited/, {selector:'.reader-resource p'})).toBeInTheDocument();
 expect(screen.getByRole('link',{name:'Email Joshua'})).toHaveAttribute('href','mailto:joshua@aquidneckai.com');
});
it('searches across place, topic and practical usefulness with a reset',async()=>{
 feed();render(<ReaderHome/>);await screen.findByText('No current listings published here yet.');
 const search=screen.getByRole('searchbox');fireEvent.change(search,{target:{value:'Newport'}});
 expect(screen.getByText('1 matching resources')).toBeInTheDocument();
 expect(screen.getByRole('link',{name:/Explore Salve Regina/})).toBeInTheDocument();
 fireEvent.change(search,{target:{value:'zzzz'}});expect(screen.getByText('0 matching resources')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Show all resources'}));expect(search).toHaveValue('');
 expect(screen.getByRole('link',{name:/Explore AI training for your team/})).toBeInTheDocument();
 fireEvent.change(search,{target:{value:'Newport'}});
 fireEvent.click(screen.getByRole('link',{name:'Start with the SBA guide'}));
 expect(search).toHaveValue('');
 expect(document.getElementById('sba-ai-small-business')).toBeInTheDocument();
});
it('separates past events and never mistakes them for current listings',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({items:[],pastEvents:[{id:'past',title:'Past AI workshop',canonical_url:'https://events.salve.edu/event/example',summary:'Workshop background',kind:'event',starts_at:'2026-09-22',ends_at:null,published_at:'2026-09-16'}]})}));
 render(<ReaderHome/>);await screen.findByText('No current listings published here yet.');
 const archive=screen.getByText('Past events (1)').closest('details')!;
 expect(within(archive).getByText('Past event · Sep 22, 2026')).toBeInTheDocument();
 expect(archive).not.toHaveAttribute('open');
});
it('does not present failed loading as an empty calendar and supports retry',async()=>{
 const fetcher=vi.fn().mockResolvedValueOnce({ok:false}).mockResolvedValueOnce({ok:true,json:async()=>({items:[],pastEvents:[]})});vi.stubGlobal('fetch',fetcher);
 render(<ReaderHome/>);expect(await screen.findByRole('alert')).toHaveTextContent('temporarily unavailable');
 expect(screen.queryByText('No current listings published here yet.')).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Retry listings'}));expect(await screen.findByText('No current listings published here yet.')).toBeInTheDocument();
});
it('provides fixed, expandable examples without collecting user input',async()=>{
 feed();render(<ReaderHome/>);await screen.findByText('No current listings published here yet.');
 expect(screen.getAllByText('Try this approach')).toHaveLength(3);
 expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
 expect(screen.getByText(/Do not invent prices/)).toBeInTheDocument();
});
