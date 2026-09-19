import {useState} from 'react';
export type ReviewItem={id:string;title:string;url:string;source:string;date:string|null;excerpt:string;decision:string;issue:string|null;reason:string;aiEvidence:string;localEvidence:string;modelDecision:string|null;modelReason:string|null;status:string;destination:string|null};
export default function ReviewQueue({items=[]}:{items?:ReviewItem[]}){
 const [filter,setFilter]=useState('needs_review'),[query,setQuery]=useState('');
 const visible=items.filter(i=>(filter==='all'||i.decision===filter)&&`${i.title} ${i.source} ${i.excerpt}`.toLowerCase().includes(query.toLowerCase()));
 return <details className="aq-note" id="assessment-review"><summary style={{cursor:'pointer',fontWeight:700}}>Inspect collected articles and assessment decisions ({items.length})</summary>
 <p>This private staging view includes excluded articles and incomplete assessments. A review label does not mean the article was approved. Nothing here is published by opening it.</p>
 <label>Show <select aria-label="Assessment filter" value={filter} onChange={e=>setFilter(e.target.value)}>{[['needs_review','Needs human review'],['pending','Awaiting assessment'],['reject','Excluded'],['candidate','Candidates'],['all','All collected items']].map(([value,label])=><option key={value} value={value}>{label} ({value==='all'?items.length:items.filter(i=>i.decision===value).length})</option>)}</select></label>{' '}
 <input aria-label="Search collected articles" placeholder="Search title, source or excerpt" value={query} onChange={e=>setQuery(e.target.value)}/>
 <p>{visible.length} matching records. Revisions or overlapping feeds may contain the same article.</p>
 {visible.map(i=><article className="aq-item" key={i.id}><h3><a href={i.url} target="_blank" rel="noreferrer">{i.title} ↗</a></h3><p>{i.source} · {i.date?new Date(i.date).toLocaleDateString():'Date unknown'}</p>
 <p><strong>{i.decision==='needs_review'?'Needs human review':i.decision==='pending'?'Awaiting assessment':i.decision==='reject'?'Excluded':'Candidate — publication checked separately'}</strong>: {i.reason}</p>
 {i.issue&&<p>Assessment issue: {i.issue.replaceAll('_',' ')}. No automatic paid retry.</p>}
 {i.aiEvidence&&<p>AI evidence: “{i.aiEvidence}”</p>}{i.localEvidence&&<p>Local basis: {i.localEvidence}</p>}
 {i.modelDecision&&i.modelDecision!==i.decision&&<p>Model originally said {i.modelDecision}: {i.modelReason}. The evidence check withheld that decision.</p>}
 <details><summary>Collected source excerpt</summary><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{i.excerpt||'No description supplied by this feed.'}</p></details></article>)}
 </details>;
}
