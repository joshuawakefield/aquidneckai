import fs from 'node:fs';
import {allRows,database} from './supabase-server.mjs';
import {assessResponse} from './assessment-result.mjs';
export async function recoverAssessments(){
 const [trials,observations]=await Promise.all([allRows('aq_classification_trials?select=request_id,report&order=request_id'),allRows('aq_observations?select=*&order=id')]);
 const cached=new Map();const directory=new URL('../data/classification-responses/',import.meta.url);
 if(fs.existsSync(directory))for(const name of fs.readdirSync(directory).filter(n=>n.endsWith('.json'))){
  try{const batch=JSON.parse(fs.readFileSync(new URL(name,directory)));for(const input of batch.inputs??[])cached.set(input.id,{input,response:batch.response,count:batch.inputs.length});}catch{}
 }
 let recovered=0,flagged=0;
 for(const trial of trials){const report=trial.report;
  if(report.kind!=='observation_classification'||report.status==='completed'||Date.now()-Date.parse(report.claimed_at)<900000)continue;
  const o=observations.find(o=>o.id===report.observation_id);if(!o)continue;
  const saved=report.saved_response?{input:report.saved_input,response:report.saved_response,count:report.saved_batch_size??null}:cached.get(o.id);
  const input=saved?.input??{id:o.id,text:(o.title+'\n'+(o.evidence_excerpt??'')).slice(0,2500)};
  const assessed=assessResponse(input,o,saved?.response);
  if(!saved){assessed.assessment_issue='response_unavailable';assessed.result.reason='Human review required: an earlier assessment attempt did not save a recoverable response. No paid retry was made.';flagged++;}else recovered++;
  await database('aq_classification_trials?request_id=eq.'+encodeURIComponent(trial.request_id)+'&report->>status=neq.completed',{method:'PATCH',body:{report:{...report,...assessed,status:'completed',completed_at:new Date().toISOString(),reconciled_at:new Date().toISOString(),input_text:input.text,provider_request_id:saved?.response?.id??null,allocated_cost_usd:saved?.count&&typeof saved.response?.usage?.cost==='number'?saved.response.usage.cost/saved.count:null}}});
 }
 console.log(JSON.stringify({recoveredFromSavedResponse:recovered,flaggedForHumanReview:flagged,paidRecoveryRequests:0}));
}
