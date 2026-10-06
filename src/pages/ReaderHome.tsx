import {useEffect, useState} from 'react';
import {flushSync} from 'react-dom';
import {ArrowUpRight, ArrowRight, Search, Waves} from 'lucide-react';
import {readerResources} from '@/data/reader-resources';
import {formatReaderDate as dateText} from '@/lib/date-format';
import './reader-home.css';

type PublishedItem = {id:string; title:string; canonical_url:string; summary:string; local_evidence?:string; kind:string; starts_at:string|null; ends_at:string|null; published_at:string|null};
type PublishedFeed = {items:PublishedItem[]; pastEvents:PublishedItem[]};
const featured = readerResources[0];
const website = (url:string) => {try {const u=new URL(url); return /^https?:$/.test(u.protocol) ? u.hostname.replace(/^www\./,'') : '';} catch {return '';}};

const experiments = [
  {title:'Follow up on a customer’s estimate request',example:'Working for yourself or with a small trades team? Practice a short reply after a busy day, using only the made-up repair request below.',prompt:'Using only these fictional facts, draft a friendly follow-up of no more than 80 words. Facts: I run a small carpentry business. A customer asked for an estimate to repair a wooden garden gate. I need to know whether the gate opens and closes before I can prepare the estimate. No price, visit or completion date has been agreed. Ask for the missing detail. Do not invent prices, availability, appointments, guarantees or prior conversations. List uncertain details separately from the message. Leave sending to me.',check:'Compare every claim with the fictional facts. Remove anything invented, including promises about price or timing. Edit the tone or reject the draft. This site does not send messages: you decide whether to send a checked message manually. Compare time spent drafting AND checking with your usual approach; AI may not help.',practice:'Copy the prompt into an AI tool you already use. Keep this practice fictional: do not add real customer names, contact details or messages.'},
  {title:'Make a repeated explanation easier to find',example:'Parking instructions, opening hours, or answers to common customer questions.',prompt:'Turn these public instructions into five short questions and answers. Use only the information provided. Flag anything unclear instead of guessing.',check:'Check every answer against the actual policy before sharing it. Link to the original instructions.'},
  {title:'Understand a complicated announcement',example:'An AI product update, a university program, or a new training opportunity.',prompt:'Summarize the text below in plain English. Separate confirmed facts from predictions. What could a small business test now, and what is still uncertain? Cite the passage behind each claim.',check:'Open the original source and check the cited passages. A plausible explanation is still only a draft.'},
];

function Publication({item,past=false}:{item:PublishedItem;past?:boolean}) {
  const domain=website(item.canonical_url);
  if(!domain)return null;
  return <article className="reader-publication">
    <p className="reader-meta">{past?'Past event':item.kind==='event'?'Event':'Published'}{(item.starts_at||item.published_at)&&<> · {dateText((item.starts_at||item.published_at)!)}</>}</p>
    <h3><a href={item.canonical_url} target="_blank" rel="noreferrer">{item.title}<ArrowUpRight aria-hidden="true" size={18}/></a></h3>
    {!past&&item.summary&&<p>{item.summary.length>240?item.summary.slice(0,237)+'…':item.summary}</p>}
    {!past&&item.local_evidence&&<p className="reader-useful"><strong>Why it matters here</strong> {item.local_evidence}</p>}
    <span className="reader-meta">Source: {domain}</span>
  </article>;
}

export default function ReaderHome(){
  const [query,setQuery]=useState('');
  const [feed,setFeed]=useState<PublishedFeed>();
  const [error,setError]=useState(false);
  const [attempt,setAttempt]=useState(0);
  const revealResources=()=>flushSync(()=>setQuery(''));
  useEffect(()=>{
    const controller=new AbortController();setError(false);
    const deadline=setTimeout(()=>{setError(true);controller.abort();},12000);
    fetch('/api/aqai/published',{signal:controller.signal}).then(async r=>{
      if(!r.ok)throw Error('Unavailable');
      const data=await r.json();
      if(!Array.isArray(data.items)||!Array.isArray(data.pastEvents))throw Error('Invalid response');
      if(!controller.signal.aborted)setFeed(data);
    }).catch(()=>{if(!controller.signal.aborted)setError(true);}).finally(()=>clearTimeout(deadline));
    return()=>{clearTimeout(deadline);controller.abort();};
  },[attempt]);
  const matches=readerResources.filter(r=>[r.title,r.description,r.whyUseful,r.organization,r.area,r.kind].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="reader-page">
    <a href="#main-content" className="reader-skip">Skip to content</a>
    <header className="reader-header reader-wrap">
      <a className="reader-brand" href="/" aria-label="Aquidneck AI home">Aquidneck<span>AI</span><small>RHODE ISLAND, IN THE AI AGE</small></a>
      <nav aria-label="Main navigation"><a href="#resources">Learn & explore</a><a href="#put-it-to-work">Put AI to work</a><a href="#latest">Latest</a></nav>
    </header>
    <main id="main-content">
      <section className="reader-hero reader-wrap" aria-labelledby="reader-title">
        <div><p className="reader-eyebrow"><Waves size={18} aria-hidden="true"/> Aquidneck Island · Rhode Island · A wider perspective</p>
          <h1 id="reader-title">Make sense of AI.<br/><em>Put it to use here.</em></h1>
          <p className="reader-intro">A useful starting point for people and businesses on Aquidneck Island: where to learn, what to try, and which developments deserve a closer look.</p>
          <a className="reader-button" href="#resources">Find your starting point <ArrowRight size={18} aria-hidden="true"/></a>
          <p className="reader-small">Free to read. Original sources linked. Local relevance explained.</p>
        </div>
        <aside className="reader-feature" aria-labelledby="featured-title"><span className="reader-eyebrow">A good place to begin</span><span className="reader-feature-number" aria-hidden="true">01 / LEARN</span>
          <h2 id="featured-title">AI training.<br/>Rhode Island access.</h2><p>{featured.description}</p>
          <a href={featured.href} target="_blank" rel="noreferrer">Explore the state’s program <ArrowUpRight size={18} aria-hidden="true"/></a>
          <p className="reader-small">{featured.organization} · Checked {dateText(featured.checkedAt)}</p>
        </aside>
      </section>

      <section id="resources" className="reader-section reader-wrap" aria-labelledby="resources-title">
        <div className="reader-section-heading"><div><p className="reader-eyebrow">A short list worth your time</p><h2 id="resources-title">Learn, explore, connect.</h2><p>Useful places to start, from Newport to the wider AI world.</p></div>
          <label className="reader-search"><Search size={18} aria-hidden="true"/><span className="reader-sr-only">Search learning and business resources</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try training, business, Newport…"/></label>
        </div>
        <p className="reader-small" role="status">{query?`${matches.length} matching resources`:'Selected resources · Links and descriptions checked October 5, 2026. Check providers for current availability.'}</p>
        <div className="reader-resources">{matches.map((resource,index)=><article id={resource.id} className="reader-resource" key={resource.id}>
          <div className="reader-resource-top"><span className="reader-meta">{resource.kind} · {resource.area}</span><span aria-hidden="true">{String(index+1).padStart(2,'0')}</span></div>
          <h3><a href={resource.href} target="_blank" rel="noreferrer">{resource.title}<ArrowUpRight size={19} aria-hidden="true"/></a></h3>
          <p>{resource.description}</p><p className="reader-useful"><strong>Why it’s useful</strong> {resource.whyUseful}</p>
          <div className="reader-resource-footer">{resource.organization}{resource.updatedAt&&<span>Source updated {dateText(resource.updatedAt)}</span>}</div>
        </article>)}</div>
        {!matches.length&&<div className="reader-empty"><p>No resources match “{query}”. Try a topic such as training or business.</p><button onClick={()=>setQuery('')}>Show all resources</button></div>}
      </section>

      <section id="put-it-to-work" className="reader-practice" aria-labelledby="practice-title"><div className="reader-wrap">
        <div className="reader-section-heading"><div><p className="reader-eyebrow">One task. A small experiment.</p><h2 id="practice-title">What could AI do for you?</h2></div><p>Start with work you already understand. Try these examples in an AI tool you use, with public or fictional information.</p></div>
        <div className="reader-experiments">{experiments.map((task,i)=><article key={task.title}><span className="reader-step">0{i+1}</span><h3>{task.title}</h3><p>{task.example}</p><details><summary>Try this approach <ArrowRight size={16} aria-hidden="true"/></summary>{task.practice&&<p>{task.practice}</p>}<blockquote>{task.prompt}</blockquote><p><strong>Before you use it:</strong> {task.check}</p></details></article>)}</div>
        <p className="reader-practice-link">Want a more structured introduction? <a href="#sba-ai-small-business" onClick={revealResources}>Start with the SBA guide</a> or <a href="#uri-ai-workplace" onClick={revealResources}>explore training for your team</a>.</p>
      </div></section>

      <section id="latest" className="reader-section reader-wrap" aria-labelledby="latest-title"><div className="reader-section-heading"><div><p className="reader-eyebrow">Dates matter</p><h2 id="latest-title">Published updates & upcoming events</h2></div><p>Open the original listing for registration, location and any schedule changes.</p></div>
        {error?<div className="reader-empty" role="alert"><p>Published listings are temporarily unavailable. The learning resources above are still available.</p><button onClick={()=>setAttempt(n=>n+1)}>Retry listings</button></div>:!feed?<p role="status">Loading published listings…</p>:<>
          {feed.items.length?<div className="reader-publications">{feed.items.map(item=><Publication item={item} key={item.id}/>)}</div>:<div className="reader-empty"><h3>No current listings published here yet.</h3><p>You can still find scheduled workshops on the <a href="#uri-ai-lab-workshops" onClick={revealResources}>URI AI Lab calendar</a> and the <a href="#ri-ai-hub-events" onClick={revealResources}>state AI Hub calendar</a>. A page we monitor is not automatically a published recommendation.</p></div>}
          {feed.pastEvents.length>0&&<details className="reader-past"><summary>Past events ({feed.pastEvents.length})</summary><p>These events have ended. Their original pages may offer background or follow-up material.</p><div className="reader-publications">{feed.pastEvents.map(item=><Publication item={item} past key={item.id}/>)}</div></details>}
        </>}
      </section>

      <section className="reader-about reader-wrap" aria-labelledby="about-title"><div><p className="reader-eyebrow">About this project</p><h2 id="about-title">A local point of view.<br/>An open field of vision.</h2></div><div><p>Aquidneck AI is an independent project run by Joshua Wakefield. We connect AI developments with life and work on Aquidneck Island, drawing on Rhode Island, regional and national sources when they help explain what matters here.</p><p>AI helps collect and assess material. Collection is not endorsement: source evidence, dates and publication checks come first. The selected starting points above link directly to their providers.</p><p>Found an error, a useful resource, or interested in sponsorship? <a href="mailto:joshua@aquidneckai.com">Email Joshua</a>. Sponsorship inquiries do not guarantee editorial inclusion.</p></div></section>
    </main>
    <footer className="reader-footer reader-wrap"><a className="reader-brand" href="/">Aquidneck<span>AI</span></a><p>Curiosity, with a sense of place.</p><a href="/admin">Editorial workspace</a></footer>
  </div>;
}
