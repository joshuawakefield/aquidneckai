import { useEffect, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EvidenceText from '@/components/EvidenceText';
import { eventTiming, formatReaderDate } from '@/lib/date-format';
import './index-preview.css';
import ReviewQueue from './ReviewQueue';

type Source = {id:string; name:string; url:string; towns:string[]; kind:string; status:string; checkedAt:string|null; enabled:boolean; collecting:boolean; itemCount:number; mode?:string; scope?:string; setupIssue?:string; errorCode?:string};
type Item = {id:string; title:string; url:string; source:string; towns:string[]; date:string|null; destination:string; aiEvidence:string; localEvidence:string; status:string; kind:string|null; startsAt?:string|null; endsAt?:string|null; publishedAt?:string|null};
type Data = {fetchedAt:string; sources:Source[]; items:Item[]; reviewRequired?:number; observations:number; classified:number; classificationPending:number; candidateDisplayLimit?:number};

function ItemDates({item}:{item:Item}) {
  if (item.kind === 'event') return <span>{item.startsAt ? `${eventTiming(item.startsAt, item.endsAt) === 'past' ? 'Past event' : 'Event date'}: ${formatReaderDate(item.startsAt)}` : 'Event date not confirmed'}</span>;
  return <span>{item.date ? `Source date: ${formatReaderDate(item.date)}` : 'Source date unavailable · Page snapshot or undated item'}</span>;
}

export default function IndexPreview() {
  const [data, setData] = useState<Data|null>(null), [error, setError] = useState('');
  const [query, setQuery] = useState(''), [town, setTown] = useState('All coverage');
  const [coverage, setCoverage] = useState('all');
  useEffect(() => {
    const controller = new AbortController(); let stopped = false, inFlight = false;
    async function refresh() {
      if (document.hidden || inFlight || stopped) return;
      inFlight = true;
      try {
        const response = await fetch('/api/aqai/preview', {signal:controller.signal});
        if (!response.ok) throw Error();
        const next = await response.json();
        if (!stopped) { setData(next); setError(''); }
      } catch { if (!stopped) setError('Database refresh failed. Displayed data, if any, is from the last successful refresh.'); }
      finally { inFlight = false; }
    }
    refresh(); const timer = setInterval(refresh, 300000); document.addEventListener('visibilitychange', refresh);
    return () => { stopped = true; controller.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, []);

  const matches = (towns:string[], text:string) => (town === 'All coverage' || towns.includes(town)) && text.toLowerCase().includes(query.trim().toLowerCase());
  const sources = (data?.sources ?? []).filter(source => matches(source.towns, `${source.name} ${source.kind} ${source.towns.join(' ')} ${source.setupIssue ?? ''}`))
    .filter(source => coverage === 'all' || (coverage === 'waiting' && !source.collecting) || (coverage === 'failed' && source.status === 'failed') || (coverage === 'pages' && source.mode === 'public_page') || (coverage === 'feeds' && source.collecting && source.mode !== 'public_page'));
  const items = (data?.items ?? []).filter(item => matches(item.towns, `${item.title} ${item.source} ${item.aiEvidence} ${item.localEvidence}`));
  const pastEvent = (item:Item) => item.kind === 'event' && eventTiming(item.startsAt, item.endsAt) === 'past';
  const sections = [
    {label:'AI candidates', key:'current', matches:(item:Item) => item.destination === 'current_review' && !pastEvent(item) && !(item.kind === 'event' && !item.startsAt)},
    {label:'Date needs checking', key:'dates', matches:(item:Item) => !pastEvent(item) && (item.destination === 'date_review' || (item.kind === 'event' && !item.startsAt))},
    {label:'Past events and archive resources', key:'archive', matches:(item:Item) => pastEvent(item) || (item.destination === 'archive_review' && !(item.kind === 'event' && !item.startsAt))},
  ];

  return <div className="aq-index aq-editorial">
    <a className="aq-skip-link" href="#editorial-main">Skip to editorial workspace</a>
    <header className="aq-header"><a href="/" className="aq-brand">Aquidneck<span>AI</span><small>EDITORIAL WORKSPACE</small></a><a href="/">Reader homepage <ArrowUpRight size={16}/></a></header>
    <main id="editorial-main">
      <div className="aq-kicker">PRIVATE · COLLECTION AND EVIDENCE REVIEW</div>
      <section className="aq-intro"><div><h1>Editorial workspace</h1><p>Inspect collected material, assessment issues, and source coverage. Candidate labels are suggestions, not completed editorial approval.</p></div><aside><span>REVIEW BEFORE RELYING ON IT</span><strong>Collection is not publication.</strong><p>Opening a record does not approve or publish it. Use the editorial decision controls after reviewing the source and evidence.</p></aside></section>
      {error && <p role="alert">{error}</p>}{!data && !error && <p role="status">Loading the editorial overview…</p>}
      {data && <>
        <p className="aq-caption">{data.observations} collected items · {data.classified} processed · {data.classificationPending} awaiting assessment · {data.reviewRequired ?? 0} unresolved review items</p>
        <p className="aq-caption">Processed does not mean approved. Incomplete assessments and failed evidence checks still need review. Overview refreshed {formatReaderDate(data.fetchedAt)} at {new Date(data.fetchedAt).toLocaleTimeString('en-US', {timeZone:'America/New_York'})} ET; refreshes every five minutes while visible.</p>
        <ReviewQueue observations={data.observations}/>
      </>}
      <section className="aq-search" aria-label="Search editorial candidates and sources">
        <label htmlFor="aq-search"><Search size={20} aria-hidden="true"/><span className="sr-only">Search editorial candidates and sources</span><Input id="aq-search" type="search" placeholder="Search organizations, AI topics, or evidence" value={query} onChange={event => setQuery(event.target.value)}/></label>
        <div className="aq-towns">{['All coverage','Newport','Middletown','Portsmouth'].map(name => <Button key={name} variant="ghost" aria-pressed={town === name} onClick={() => setTown(name)}>{name}</Button>)}</div>
      </section>
      <section className="aq-candidates" aria-label="Editorial candidates">
        <p className="aq-caption">Up to {data?.candidateDisplayLimit ?? 100} recent candidates appear here. Use the assessment review above to search all collected records. Unknown source dates do not establish an upcoming event.</p>
        {sections.map(section => {
          const list = items.filter(section.matches);
          return <section key={section.key} aria-labelledby={`aq-section-${section.key}`}><div className="aq-section-heading"><h2 id={`aq-section-${section.key}`}>{section.label}</h2><span>{list.length}</span></div>
            {list.map(item => <article key={item.id} className="aq-item">
              <div className="aq-item-top"><ItemDates item={item}/><span>{item.status === 'published' ? 'Published · Passed automated event checks' : 'Unpublished · Needs verification'}</span></div>
              <h3><a href={item.url} target="_blank" rel="noreferrer">{item.title}<ArrowUpRight size={22} aria-hidden="true"/></a></h3><p>{item.source}</p>
              {item.aiEvidence && <div><strong>AI evidence</strong><EvidenceText text={item.aiEvidence}/></div>}
              {item.localEvidence && <div><strong>Relevance and context</strong><EvidenceText text={item.localEvidence}/></div>}
              {item.status !== 'published' && <p className="aq-caption">Source context and AI assessment; awaiting verification.</p>}
              {item.kind === 'event' && item.date && <p className="aq-caption">Source date: {formatReaderDate(item.date)}. Use the event date above for attendance.</p>}
              <footer><span>{item.towns.join(' · ') || 'Wider AI context'}</span><a href={item.url} target="_blank" rel="noreferrer">Original source ↗</a></footer>
            </article>)}
            {data && !list.length && <p className="aq-caption">No matching {section.label.toLowerCase()} in this overview.</p>}
          </section>;
        })}
      </section>
      <details id="coverage" className="aq-coverage"><summary>Source coverage and collection diagnostics ({data?.sources.length ?? 0} endpoints)</summary>
        <p className="aq-caption">{data?.sources.filter(source => source.checkedAt).length ?? 0} checked · {data?.sources.filter(source => source.collecting).length ?? 0} collecting automatically · {data?.sources.filter(source => source.enabled && !source.collecting).length ?? 0} awaiting setup</p>
        <p className="aq-caption">These are monitored endpoints, not a count of verified AI stories. Public page watches do not read every linked article, attachment, or embedded calendar.</p>
        <label className="aq-source-filter">Show sources <select value={coverage} onChange={event => setCoverage(event.target.value)}><option value="all">All sources</option><option value="feeds">Feeds and APIs</option><option value="pages">Public page watches</option><option value="waiting">Awaiting setup</option><option value="failed">Last check failed</option></select></label>
        <div className="aq-source-list">{sources.map(source => <article key={source.id}>
          <div><a href={source.url} target="_blank" rel="noreferrer">{source.name} <ArrowUpRight size={14} aria-hidden="true"/></a><small>{source.towns.join(' · ')} · {source.kind}</small></div>
          <p>{source.status === 'parsed' ? (source.mode === 'public_page' ? 'Page text checked' : 'Feed/API checked') : source.status === 'failed' ? 'Last check failed' : 'Not yet checked'} · {source.collecting ? (source.mode === 'public_page' ? 'Automatic page watch' : 'Collecting automatically') : source.enabled ? 'Requested · Awaiting setup' : 'Recurring off'}</p>
          <small>{source.checkedAt ? `${source.itemCount} items · Checked ${formatReaderDate(source.checkedAt)}` : 'Listed; collection not yet verified'}</small>
          {source.scope && <small>{source.scope}</small>}{source.setupIssue && <small>Setup: {source.setupIssue}</small>}{source.errorCode && <small>Last error: {source.errorCode}</small>}
        </article>)}</div>
        {!sources.length && data && <p>No sources match the current search and filters.</p>}
      </details>
      <footer className="aq-footer"><span>AquidneckAI · Private editorial workspace</span><a href="/">Return to reader homepage</a></footer>
    </main>
  </div>;
}
