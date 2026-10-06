import {render,screen,cleanup,fireEvent} from '@testing-library/react';
import {afterEach,expect,it} from 'vitest';
import EvidenceText from './EvidenceText';
afterEach(cleanup);

it('highlights AI evidence as text without interpreting upstream HTML',()=>{
  const {container}=render(<EvidenceText text={'<img src=x onerror="alert(1)"> AI and ChatGPT'}/>);
  expect(container.querySelector('img')).toBeNull();
  expect(container.querySelectorAll('mark')).toHaveLength(2);
  expect(container.textContent).toContain('<img src=x onerror="alert(1)">');
});

it('keeps long excerpts collapsed while making the full text available',()=>{
  const text='AI text. '.repeat(100)+'Final source detail.';
  render(<EvidenceText text={text} limit={100}/>);
  const details=screen.getByText('Read full collected text').closest('details');
  expect(details).not.toHaveAttribute('open');
  fireEvent.click(screen.getByText('Read full collected text'));
  expect(details).toHaveAttribute('open');
  expect(details).toHaveTextContent('Final source detail.');
});
