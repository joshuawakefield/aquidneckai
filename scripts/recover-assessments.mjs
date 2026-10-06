import {database} from './supabase-server.mjs';
import {assessResponse} from './assessment-result.mjs';
import {loadRecoveryResponses} from './recovery-cache.mjs';
export async function recoveryWork(db=database,now=Date.now()){
 const cutoff=new Date(now-900000).toISOString();
 const trials=await db('aq_classification_trials?report->>kind=eq.observation_classification&report->>status=neq.completed&report->>claimed_at=lt.'+encodeURIComponent(cutoff)+'&select=request_id,report&order=recorded_at.asc,request_id.asc&limit=80');
 if(!trials.length)return {trials,observations:[]};
 const ids=[...new Set(trials.map(t=>t.report.observation_id))];
 if(ids.some(id=>!/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(id)))throw Error('Invalid recovery observation ID');
 const observations=await db('aq_observations?id=in.('+ids.join(',')+')&select=id,title,evidence_excerpt,source_published_at&limit=80');
 return {trials,observations};
}
export async function recoverAssessments(){
 const {trials,observations}=await recoveryWork();
 if(!trials.length){console.log(JSON.stringify({recoveredFromSavedResponse:0,flaggedForHumanReview:0,paidRecoveryRequests:0}));return;}
 const observationById=new Map(observations.map(o=>[o.id,o]));
 const cached=loadRecoveryResponses(trials,{directory:new URL('../data/classification-responses/',import.meta.url)});
 let recovered=0,flagged=0;
 for(const trial of trials){const report=trial.report;
  if(report.kind!=='observation_classification'||report.status==='completed'||Date.now()-Date.parse(report.claimed_at)<900000)continue;
  const o=observationById.get(report.observation_id);if(!o)continue;
  const saved=report.saved_response?{input:report.saved_input,response:report.saved_response,count:report.saved_batch_size??null}:cached.get(o.id);
  const input=saved?.input??{id:o.id,text:(o.title+'\n'+(o.evidence_excerpt??'')).slice(0,2500)};
  const assessed=assessResponse(input,o,saved?.response);
  if(!saved){assessed.assessment_issue='response_unavailable';assessed.result.reason='Human review required: an earlier assessment attempt did not save a recoverable response. No paid retry was made.';flagged++;}else recovered++;
  await database('aq_classification_trials?request_id=eq.'+encodeURIComponent(trial.request_id)+'&report->>status=neq.completed',{method:'PATCH',body:{report:{...report,...assessed,status:'completed',completed_at:new Date().toISOString(),reconciled_at:new Date().toISOString(),input_text:input.text,provider_request_id:saved?.response?.id??null,allocated_cost_usd:saved?.count&&typeof saved.response?.usage?.cost==='number'?saved.response.usage.cost/saved.count:null}}});
 }
 console.log(JSON.stringify({recoveredFromSavedResponse:recovered,flaggedForHumanReview:flagged,paidRecoveryRequests:0}));
}
