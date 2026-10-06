// Durable observation-level claims: an uncertain paid attempt is never auto-retried.
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import { database } from './supabase-server.mjs';
import {assessResponse} from './assessment-result.mjs';
import {recoverAssessments} from './recover-assessments.mjs';
import {assessmentText} from './assessment-text.mjs';
import {assessmentPrompt} from './assessment-prompt.mjs';
import {assessmentBatches,assessmentItemSchema,ASSESSMENT_MAX_OUTPUT_TOKENS} from './assessment-batches.mjs';
const model='google/gemini-2.5-flash-lite';
const api=async(path,body)=>{
 const r=await fetch('https://openrouter.ai/api/v1/'+path,{method:body?'POST':'GET',
  headers:{Authorization:`Bearer ${process.env.OPENROUTER_API_KEY}`,'Content-Type':'application/json'},
  body:body?JSON.stringify(body):undefined,redirect:'error',signal:AbortSignal.timeout(45000)});
 if(!r.ok)throw Error(`OpenRouter HTTP ${r.status}`);return r.json();
};
const patch=(id,report)=>database('aq_classification_trials?request_id=eq.'+encodeURIComponent(id),{method:'PATCH',body:{report}});
try{
 await recoverAssessments();
 const reassess=process.argv.includes('--reassess-incomplete-once');
 const work=await database('rpc/aq_pending_assessments',{method:'POST',body:{p_limit:80,p_reassess:reassess}});
 const registry=new Map(work.map(w=>[w.source.source_id,w.source]));
 const recoverable=new Map(work.filter(w=>w.prior_report).map(w=>['observation-v1:'+w.observation.id,w.prior_report]));
 const pending=work.map(w=>w.observation);
 if(!pending.length){console.log(JSON.stringify({pending:0,paidRequests:0}));process.exit(0);}
 const account=(await api('key')).data;
 if(!(account.limit>0&&account.limit<=1&&account.limit_reset===null&&account.limit_remaining>=0.02))throw Error('Budget preflight failed');
 const catalog=(await api('models')).data.find(m=>m.id===model);
 if(!catalog||Number(catalog.pricing.prompt)>1e-7||Number(catalog.pricing.completion)>4e-7)throw Error('Model pricing changed');
 let paidRequests=0,totalCost=0;
 for(const batch of assessmentBatches(pending,assessmentText)){
  const claimed=[];
  for(const o of batch){
   const id='observation-v1:'+o.id;
   const prior=reassess?recoverable.get(id):null;
   const report={kind:'observation_classification',observation_id:o.id,status:'claimed',model,claimed_at:new Date().toISOString(),...(prior?{reassessment_attempted:true,previous_assessment:prior,attempt_token:randomUUID()}: {})};
   try{
    if(prior){
     await database('aq_classification_trials?request_id=eq.'+encodeURIComponent(id)+'&report->>status=eq.completed&report->>reassessment_attempted=is.null',{method:'PATCH',body:{report}});
     const saved=await database('aq_classification_trials?request_id=eq.'+encodeURIComponent(id)+'&select=report');
     if(saved[0]?.report.attempt_token!==report.attempt_token)continue;
    }else await database('aq_classification_trials',{method:'POST',body:{request_id:id,report}});
    claimed.push({o,id,report});}
   catch(e){if(!e.message.includes('HTTP 409'))throw e;}
  }
  if(!claimed.length)continue;
  const inputs=claimed.map(({o})=>{const s=registry.get(o.source_id);return {
   id:o.id,text:assessmentText(o),sourceDate:o.source_published_at,
   organization:s?.organization,municipality:s?.definition.municipality,sourceKind:s?.definition.endpoint_type};});
  const messages=[{role:'system',content:assessmentPrompt},{role:'user',content:JSON.stringify(inputs)}];
  let response;
  try{
   response=await api('chat/completions',{model,messages,temperature:0,max_tokens:ASSESSMENT_MAX_OUTPUT_TOKENS,provider:{require_parameters:true},response_format:{type:'json_schema',json_schema:{name:'aqai_observations',strict:true,schema:{type:'object',additionalProperties:false,required:['items'],properties:{items:{type:'array',minItems:claimed.length,maxItems:claimed.length,items:assessmentItemSchema}}}}}});
   paidRequests++;totalCost+=response.usage?.cost??0;
   // Save the public-input response before database updates so interrupted writes can be recovered without another paid call.
   fs.mkdirSync(new URL('../data/classification-responses/',import.meta.url),{recursive:true});
   fs.writeFileSync(new URL('../data/classification-responses/'+claimed[0].o.id+'.json',import.meta.url),JSON.stringify({inputs,response},null,2));
   // Persist the response before interpretation so a restart can recover without repeat billing.
   for(const c of claimed)await patch(c.id,{...c.report,status:'response_saved',saved_input:inputs.find(i=>i.id===c.o.id),saved_response:response,saved_batch_size:claimed.length});
   for(const c of claimed){const input=inputs.find(i=>i.id===c.o.id);
    const assessed=assessResponse(input,c.o,response);
    await patch(c.id,{...c.report,status:'completed',completed_at:new Date().toISOString(),
     ...assessed,input_text:input.text,provider_request_id:response.id,
     allocated_cost_usd:typeof response.usage?.cost==='number'?response.usage.cost/claimed.length:null});
   }
   console.log(JSON.stringify({classified:claimed.length,cost_usd:response.usage?.cost??null}));
  }catch{
   // Claimed rows remain durable. They require reconciliation, not a paid retry loop.
   console.error('Batch needs reconciliation; existing claims prevent repeat billing.');process.exitCode=1;break;
  }
 }
 console.log(JSON.stringify({paidRequests,totalCostUSD:totalCost}));
}catch(e){console.error(e.message);process.exitCode=1;}
