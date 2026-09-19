import {enforceEvidence,routeCandidate} from './classification-policy.mjs';
import {AI_TERM} from './assessment-text.mjs';
export function assessResponse(input,observation,response,now=Date.now()){
 let items=[];
 try{const parsed=JSON.parse(response?.choices?.[0]?.message?.content);if(Array.isArray(parsed?.items))items=parsed.items;}catch{}
 const matches=items.filter(r=>r?.id===input.id);
 const r=matches.length===1?matches[0]:null;
 const valid=r&&['candidate','reject','needs_review'].includes(r.decision)&&['ai_quote','local_basis','reason'].every(k=>typeof r[k]==='string');
 const decision=valid?{id:r.id,decision:r.decision,ai_quote:r.ai_quote,local_basis:r.local_basis,reason:r.reason}:
 {id:input.id,decision:'needs_review',ai_quote:'',local_basis:'',reason:'Assessment incomplete: model returned no unique valid decision for this item.'};
 let guarded=decision.decision==='candidate'&&!decision.local_basis.trim()?{...decision,decision:'needs_review',reason:'Withheld: missing local evidence.'}:enforceEvidence(input,decision);
 if(!AI_TERM.test(input.text))guarded={...decision,decision:'reject',ai_quote:'',reason:'No explicit AI evidence in the collected title and excerpt. The full article has not been assessed.'};
 const municipality=Array.isArray(input.municipality)?input.municipality:[input.municipality];
 if(guarded.decision==='candidate'&&!municipality.some(t=>['Newport','Middletown','Portsmouth'].includes(t))&&!/\b(Newport|Middletown|Portsmouth|Aquidneck)\b/i.test(input.text))guarded={...guarded,decision:'needs_review',reason:'AI relevance is explicit, but the collected text does not establish an Aquidneck Island connection. Regional availability needs review.'};
 return {model_result:valid?decision:null,result:routeCandidate({source_id:observation.source_id,url:observation.url,sourceDate:observation.source_published_at,sourceKind:input.sourceKind},guarded,now),assessment_issue:valid?null:'invalid_or_missing_decision'};
}
