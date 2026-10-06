// One-time operator repair. Default is read-only; never calls an inference API.
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {database} from './supabase-server.mjs';
import {assessResponse} from './assessment-result.mjs';
export const OBSOLETE_GEOGRAPHY_REASON='AI relevance is explicit, but the collected text does not establish an Aquidneck Island connection. Regional availability needs review.';
export function reconcileSavedCandidate(report,observation,source,now=Date.now()){
 if(report.status!=='completed'||report.result?.reason!==OBSOLETE_GEOGRAPHY_REASON||report.result?.decision!=='needs_review'||report.model_result?.decision!=='candidate'||typeof report.input_text!=='string'||!report.input_text.trim())return null;
 if(report.observation_id!==observation?.id||report.model_result.id!==observation.id)return null;
 const input={id:observation.id,text:report.input_text,sourceKind:source?.definition?.endpoint_type};
 const assessed=assessResponse(input,observation,{choices:[{message:{content:JSON.stringify({items:[report.model_result]})}}]},now);
 if(assessed.result.decision!=='candidate')return null;
 return {...report,...assessed,coverage_reconciliation:{version:'broader-ai-coverage-v1',at:new Date(now).toISOString(),previous_result:report.result}};
}
async function main(){
 const apply=process.argv.includes('--apply'),changes=[],skipped=[];let after='',read=0;
 while(true){
  const path='aq_classification_trials?report->>status=eq.completed&report->result->>decision=eq.needs_review&report->result->>reason=eq.'+encodeURIComponent(OBSOLETE_GEOGRAPHY_REASON)+'&request_id=gt.'+encodeURIComponent(after)+'&select=request_id,report&order=request_id.asc&limit=50';
  const trials=await database(path);if(!trials.length)break;read+=trials.length;
  const ids=trials.map(t=>t.report.observation_id);
  if(ids.some(id=>!/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(id)))throw Error('Invalid saved observation identity');
  const observations=await database('aq_observations?id=in.('+ids.join(',')+')&select=id,source_id,url,source_published_at&limit=50');
  const sourceIds=[...new Set(observations.map(o=>o.source_id))];
  if(sourceIds.some(id=>!/^[a-z0-9_-]+$/i.test(id)))throw Error('Invalid saved source identity');
  const sources=sourceIds.length?await database('aq_source_registry?source_id=in.('+sourceIds.join(',')+')&select=source_id,definition&limit=50'):[];
  const byObservation=new Map(observations.map(o=>[o.id,o])),bySource=new Map(sources.map(s=>[s.source_id,s]));
  for(const trial of trials){
   const observation=byObservation.get(trial.report.observation_id),next=reconcileSavedCandidate(trial.report,observation,bySource.get(observation?.source_id));
   if(!next){skipped.push(trial.request_id);continue;}
   const change={request_id:trial.request_id,source_id:observation.source_id,url:observation.url,destination:next.result.destination,publication_status:next.result.publication_status};
   if(apply){
    if(!trial.report.completed_at)throw Error('Missing revision timestamp; refusing to overwrite a concurrent review');
    await database('aq_classification_trials?request_id=eq.'+encodeURIComponent(trial.request_id)+'&report->>completed_at=eq.'+encodeURIComponent(trial.report.completed_at)+'&report->result->>reason=eq.'+encodeURIComponent(OBSOLETE_GEOGRAPHY_REASON),{method:'PATCH',body:{report:next}});
    const verified=await database('aq_classification_trials?request_id=eq.'+encodeURIComponent(trial.request_id)+'&select=report->result,report->coverage_reconciliation&limit=1');
    if(verified[0]?.result?.decision!=='candidate'||verified[0]?.coverage_reconciliation?.at!==next.coverage_reconciliation.at)throw Error('Reconciliation readback mismatch; stopped for review');
   }
   changes.push(change);
  }
  after=trials.at(-1).request_id;if(trials.length<50)break;
 }
 const report={at:new Date().toISOString(),mode:apply?'applied':'dry-run',reviewed:read,changed:changes.length,skipped,paidRequests:0,changes};
 await mkdir(new URL('../data/',import.meta.url),{recursive:true});
 const output=new URL('../data/reader-reconciliation-'+(apply?'applied':'dry-run')+'.json',import.meta.url);
 await writeFile(output,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({mode:report.mode,reviewed:read,candidates:changes.length,skipped:skipped.length,paidRequests:0,report:fileURLToPath(output)}));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
