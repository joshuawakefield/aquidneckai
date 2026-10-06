import {cleanup,render,screen} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import App from './App';
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
it.each(['/admin','/index-preview'])('keeps the private workspace working at %s',async(path)=>{
 window.history.replaceState({},'',path);
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({fetchedAt:new Date().toISOString(),observations:7,classified:7,classificationPending:0,items:[],sources:[]})}));
 render(<App/>);
 expect(await screen.findByText(/7 collected items/)).toBeInTheDocument();
});
it('uses only the public published feed on the reader home',async()=>{
 window.history.replaceState({},'','/');
 const fetcher=vi.fn().mockResolvedValue({ok:true,json:async()=>({items:[],pastEvents:[]})});vi.stubGlobal('fetch',fetcher);
 render(<App/>);
 expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Make sense of AI.');
 expect(await screen.findByText('No current listings published here yet.')).toBeInTheDocument();
 expect(fetcher.mock.calls.every(([url])=>url==='/api/aqai/published')).toBe(true);
 expect(screen.queryByText(/collected items/)).not.toBeInTheDocument();
});
it('keeps unknown routes on the 404 page',()=>{
 window.history.replaceState({},'','/missing-page');vi.spyOn(console,'error').mockImplementation(()=>{});
 render(<App/>);expect(screen.getByText('Oops! Page not found')).toBeInTheDocument();
 expect(screen.getByRole('link',{name:'Return to Home'})).toHaveAttribute('href','/');
});
