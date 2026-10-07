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

it('makes the fictional trades follow-up discoverable with a complete prompt and manual review',async()=>{
 feed();render(<ReaderHome/>);await screen.findByText('No current listings published here yet.');
 expect(screen.getByRole('link',{name:'Put AI to work'})).toHaveAttribute('href','#put-it-to-work');
 const practice=screen.getByRole('region',{name:'What could AI do for you?'});
 const card=within(practice).getByRole('heading',{name:'Follow up on a customer’s estimate request'}).closest('article')!;
 expect(practice.querySelectorAll('article')).toHaveLength(3);
 expect(card).toHaveTextContent('small trades team');
 expect(card).toHaveTextContent('do not add real customer names, contact details or messages');
 const prompt=card.querySelector('blockquote')!;
 expect(prompt).toHaveTextContent('Using only these fictional facts');
 expect(prompt).toHaveTextContent('repair a wooden garden gate');
 expect(prompt).toHaveTextContent('whether the gate opens and closes');
 expect(prompt).toHaveTextContent('No price, visit or completion date has been agreed');
 expect(prompt).toHaveTextContent('Do not invent prices, availability, appointments, guarantees or prior conversations');
 expect(prompt).toHaveTextContent('List uncertain details separately');
 expect(card).toHaveTextContent('Compare every claim');
 expect(card).toHaveTextContent('send a checked message manually');
 expect(card).toHaveTextContent('drafting AND checking');
 expect(practice.querySelector('input,textarea,form,[contenteditable],button')).toBeNull();
 expect(fetch).toHaveBeenCalledTimes(1);
 expect(fetch).toHaveBeenCalledWith('/api/aqai/published',expect.objectContaining({signal:expect.any(AbortSignal)}));
});
it('keeps practice available through feed failure, retry and resource navigation',async()=>{
 const fetcher=vi.fn().mockResolvedValueOnce({ok:false}).mockResolvedValueOnce({ok:true,json:async()=>({items:[],pastEvents:[]})});
 vi.stubGlobal('fetch',fetcher);render(<ReaderHome/>);await screen.findByRole('alert');
 const card=screen.getByRole('heading',{name:'Follow up on a customer’s estimate request'}).closest('article')!;
 const details=card.querySelector('details')!;
 fireEvent.click(within(card).getByText('Try this approach'));expect(details).toHaveAttribute('open');
 fireEvent.change(screen.getByRole('searchbox'),{target:{value:'no such resource'}});
 fireEvent.click(screen.getByRole('link',{name:'Start with the SBA guide'}));
 expect(screen.getByRole('searchbox')).toHaveValue('');
 fireEvent.click(screen.getByRole('link',{name:'Put AI to work'}));expect(details).toHaveAttribute('open');
 fireEvent.click(screen.getByRole('button',{name:'Retry listings'}));await screen.findByText('No current listings published here yet.');
 for(let i=0;i<2;i++){
  fireEvent.click(within(card).getByText('Try this approach'));expect(details).not.toHaveAttribute('open');
  fireEvent.click(within(card).getByText('Try this approach'));expect(details).toHaveAttribute('open');
 }
 expect(fetcher).toHaveBeenCalledTimes(2);
 expect(fetcher.mock.calls.every(([url])=>url==='/api/aqai/published')).toBe(true);
});
it('aborts an interrupted visit and restores the static exercise on return without saving input',async()=>{
 const fetcher=vi.fn().mockImplementation(()=>new Promise(()=>{}));vi.stubGlobal('fetch',fetcher);
 const storage=vi.spyOn(Storage.prototype,'setItem');
 const first=render(<ReaderHome/>);
 const signal=fetcher.mock.calls[0][1].signal;
 first.unmount();expect(signal.aborted).toBe(true);
 fetcher.mockResolvedValueOnce({ok:true,json:async()=>({items:[],pastEvents:[]})});
 render(<ReaderHome/>);await screen.findByText('No current listings published here yet.');
 const card=screen.getByRole('heading',{name:'Follow up on a customer’s estimate request'}).closest('article')!;
 expect(card.querySelector('details')).not.toHaveAttribute('open');
 expect(card).toHaveTextContent('Using only these fictional facts');
 expect(storage).not.toHaveBeenCalled();expect(fetcher).toHaveBeenCalledTimes(2);
});

// Fictional source/event dates deliberately differ from the application approval.
const newsFixture={id:'news-date',title:'Fictional technology news',canonical_url:'https://example.test/story',summary:'Fixture only.',kind:'news',starts_at:'2026-09-22',ends_at:null,published_at:'2026-10-07T00:30:00Z',source_published_at:'2020-01-01'};
const renderListing=async(overrides:Record<string,unknown>={})=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({items:[{...newsFixture,...overrides}],pastEvents:[]})}));
 render(<ReaderHome/>);
 return (await screen.findByRole('heading',{name:newsFixture.title})).closest('article')!;
};
it('labels news with its AquidneckAI addition date, never source publication or event start',async()=>{
 const card=await renderListing();
 expect(within(card).getByText('Added to AquidneckAI · Oct 6, 2026')).toBeVisible();
 expect(card).not.toHaveTextContent(/Published|Sep 22|2020/);
 expect(within(card).getByRole('link',{name:newsFixture.title})).toHaveAttribute('href',newsFixture.canonical_url);
});
it.each([null,undefined,'','not-a-date','2026-02-30'])('keeps missing/invalid news addition date unknown (%s), without a source/event fallback',async(published_at)=>{
 const card=await renderListing({published_at});
 expect(within(card).getByText('Added to AquidneckAI · Date unknown')).toBeVisible();
 expect(card).not.toHaveTextContent(/Invalid Date|Published|Sep 22|2020/);
});
it.each([
 ['2026-09-22','Event · Sep 22, 2026'],
 ['2026-10-07T00:30:00Z','Event · Oct 6, 2026'],
 ['invalid','Event · Date unknown'],
 [null,'Event · Oct 6, 2026'],
])('preserves event start/date-only/invalid/fallback rendering (%s)',async(starts_at,expected)=>{
 const card=await renderListing({kind:'event',starts_at});
 expect(within(card).getByText(expected)).toBeVisible();
 expect(card).not.toHaveTextContent('Added to AquidneckAI');
});
it('preserves an undated event without inventing a timestamp',async()=>{
 const card=await renderListing({kind:'event',starts_at:null,published_at:null});
 expect(within(card).getByText('Event',{exact:true})).toBeVisible();
});
