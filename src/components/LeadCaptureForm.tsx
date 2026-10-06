import { Mail } from 'lucide-react';

const LeadCaptureForm = () => (
  <section id="intake" className="section-padding bg-navy-light/30">
    <div className="container-max max-w-2xl">
      <div className="glass-card rounded-2xl p-6 md:p-10 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Contact AquidneckAI</h2>
        <p className="text-muted-foreground mb-6">Have a correction, a Rhode Island AI resource, or a sponsorship inquiry? Email Joshua with the relevant details and source links.</p>
        <a className="btn-gold inline-flex items-center justify-center gap-2" href="mailto:joshua@aquidneckai.com?subject=AquidneckAI%20inquiry"><Mail className="w-5 h-5" aria-hidden="true"/>Email Joshua</a>
        <p className="text-muted-foreground mt-4 text-sm">This opens your email app. Send your message there; the website does not submit it.</p>
        <p className="mt-3"><a className="underline" href="mailto:joshua@aquidneckai.com">joshua@aquidneckai.com</a></p>
      </div>
    </div>
  </section>
);

export default LeadCaptureForm;
