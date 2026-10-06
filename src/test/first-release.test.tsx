import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import FirstRelease from '../../prototypes/first-release/FirstRelease';

beforeEach(()=>{vi.stubGlobal('scrollTo',vi.fn());vi.stubGlobal('fetch',vi.fn());});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
const open = (path='/') => render(<MemoryRouter initialEntries={[path]}><FirstRelease/></MemoryRouter>);
describe('first-release proposal journey',()=>{
  it('connects all four steps, labels evidence and focuses the main region',()=>{
    open();
    fireEvent.click(screen.getByRole('link',{name:/Find a useful first step/}));
    expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Where could AI help');
    expect(screen.getByText(/Source content not rechecked/)).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveFocus();
    fireEvent.click(screen.getByRole('link',{name:/Walk through the example/}));
    fireEvent.click(screen.getByRole('button',{name:'Reveal the review'}));
    expect(screen.getByText('Friday was never agreed.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Hide the review'}));
    expect(screen.queryByText('Friday was never agreed.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('link',{name:/Explore a local project/}));
    expect(screen.getByText(/Adult participation, current openings/)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
  it('cancels external handoff, restores focus and never sends a message',()=>{
    open('/connect');
    const trigger=screen.getByRole('button',{name:/Review the public contact/});
    for(let i=0;i<2;i++){
      fireEvent.click(trigger);
      expect(screen.getByRole('region',{name:'Before you leave'})).toHaveFocus();
      const link=screen.getByRole('link',{name:/Open official contact page/});
      expect(link).toHaveAttribute('href','https://fabnewport.org/contact/');
      expect(link).toHaveAttribute('target','_blank');
      fireEvent.click(screen.getByRole('button',{name:/Cancel — stay here/}));
      expect(trigger).toHaveFocus();
      expect(screen.queryByRole('region',{name:'Before you leave'})).not.toBeInTheDocument();
    }
    expect(document.querySelector('form,input,textarea')).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
  it('resets fictional practice on cancel and reentry, with a recoverable unknown path',()=>{
    open('/missing');
    fireEvent.click(screen.getByRole('link',{name:'Return to overview'}));
    fireEvent.click(screen.getByRole('link',{name:'Use'}));
    fireEvent.click(screen.getByRole('button',{name:'Reveal the review'}));
    fireEvent.click(screen.getByRole('link',{name:'Cancel practice and return home'}));
    fireEvent.click(screen.getByRole('link',{name:'Use'}));
    expect(screen.queryByText('Friday was never agreed.')).not.toBeInTheDocument();
    expect(screen.getByText(/Handwritten sample with a deliberate error/)).toBeInTheDocument();
  });
});
