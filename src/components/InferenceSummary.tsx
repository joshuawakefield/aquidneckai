import {useEffect,useState} from 'react';

export type BudgetSnapshot={checkedAt:string|null;usedUsd:number|null;remainingUsd:number|null};
const money=(value:number)=>`$${value.toFixed(4)}`;
const count=(value:number|undefined)=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0?value:'Unknown';

export default function InferenceSummary({budget,reviewRequired,pending,refreshFailed=false}:{budget?:BudgetSnapshot;reviewRequired?:number;pending?:number;refreshFailed?:boolean}) {
 const [now,setNow]=useState(Date.now);
 // Age an open tab without making another request, even after refresh failure.
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(timer);},[]);
 const currentNow=Math.max(now,Date.now());
 const checked=typeof budget?.checkedAt==='string'?Date.parse(budget.checkedAt):NaN;
 const valid=Number.isFinite(checked)&&checked<=currentNow&&typeof budget?.usedUsd==='number'&&Number.isFinite(budget.usedUsd)&&budget.usedUsd>=0&&
   typeof budget?.remainingUsd==='number'&&Number.isFinite(budget.remainingUsd)&&budget.remainingUsd>=0&&Math.abs(budget.usedUsd+budget.remainingUsd-1)<0.000001;
 const stale=valid&&(refreshFailed||currentNow-checked>15*60000);
 const state=!valid?'Usage unavailable':stale?'Usage stale':budget!.remainingUsd!<0.02?'Stopped at budget preflight':budget!.remainingUsd!<=0.10?'Near limit':'Within budget at last check';
 return <section className="aq-note" aria-labelledby="inference-heading">
  <h2 id="inference-heading">Inference budget and assessment exceptions</h2>
  <p><strong>{state}</strong></p>
  <p>Policy: $1 non-resetting key cap. It does not renew monthly. Budget preflight stops below $0.02 remaining; near-limit warning at $0.10 or less.</p>
  <p>Last usage check: {valid?<time dateTime={budget!.checkedAt!}>{new Date(checked).toISOString()}</time>:'Unavailable'}.</p>
  {valid?<p>{stale?'Last known snapshot':'Recorded snapshot'}: {money(budget!.usedUsd!)} used · {money(budget!.remainingUsd!)} remaining.</p>:<p>Usage and remaining balance are unknown, not zero. No provider usage snapshot is available in the current overview.</p>}
  <p>{!valid||stale?'Verify current usage through the authorized operator before relying on a balance. Usage older than 15 minutes or a failed overview refresh is stale.':budget!.remainingUsd!<=0.10?'Ask the authorized operator to review usage and paused work. Do not raise the cap or retry assessments to clear this warning.':'This snapshot does not establish that the worker is running or authorize more spending; price and other preflight safeguards still apply.'} Refreshing this page does not check the provider or run inference.</p>
  <p><strong>{count(reviewRequired)} unresolved review items</strong> · {count(pending)} awaiting assessment{refreshFailed?' · Last successful overview; counts may be stale':''}.</p>
  <p>Invalid evidence and uncertain assessments need human judgment. Open assessment review below and choose “Needs human review”; compare the exact source excerpt before deciding. Pending work is separate and may include interrupted attempts.</p>
  <p>For interrupted assessments, the authorized operator should reconcile saved responses first. Preserve durable claims and decision history; never delete claims or automatically repeat a paid request. This page does not retry, approve, or publish anything.</p>
  <a href="#assessment-review">Go to assessment review</a>
 </section>;
}
