import {render,screen,cleanup} from '@testing-library/react';
import {afterEach,expect,it} from 'vitest';
import LeadCaptureForm from './LeadCaptureForm';
afterEach(cleanup);
it('offers an honest email handoff without pretending the website submitted a message',()=>{
 const {container}=render(<LeadCaptureForm/>);
 expect(screen.getByRole('link',{name:'Email Joshua'})).toHaveAttribute('href','mailto:joshua@aquidneckai.com?subject=AquidneckAI%20inquiry');
 expect(screen.getByText(/website does not submit it/)).toBeInTheDocument();expect(container.querySelector('form')).toBeNull();
 expect(screen.queryByText(/inquiry has been received|within 4 hours/i)).not.toBeInTheDocument();
});
