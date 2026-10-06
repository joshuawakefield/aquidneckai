import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import {lazy, Suspense} from 'react';
import ReaderHome from './pages/ReaderHome';
const IndexPreview = lazy(() => import('./pages/IndexPreview'));

const App = () => (
      <BrowserRouter>
        <Suspense fallback={<p role="status">Loading workspace…</p>}><Routes>
          <Route path="/" element={<ReaderHome />} />
          <Route path="/admin" element={<IndexPreview />} />
          <Route path="/index-preview" element={<IndexPreview />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes></Suspense>
      </BrowserRouter>
);

export default App;
