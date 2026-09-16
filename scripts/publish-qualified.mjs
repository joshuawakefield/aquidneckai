// Initial automatic publication policy: official, upcoming local AI calendar events only.
import {allRows,database} from './supabase-server.mjs';
const AI=/\b(?:AI|artificial intelligence|machine learning|ChatGPT|generative AI|large language models?|LLMs?|neural networks?)\b/i;
const towns=new Set(['Newport','Middletown','Portsmouth']);
const [observations,registry,trials,entries]=await Promise.all([
 allRows('aq_observations?select=id,source_id,url,title,source_published_at&order=observed_at.asc,id.asc'),
 allRows('aq_source_registry?select=source_id,organization,definition,verification_status,runtime_enabled,last_check_result&order=source_id'),
 allRows('aq_classification_trials?select=request_id,report&order=request_id'),
 allRows('aq_entries?select=observation_id,canonical_url,status&order=created_at')]);
const existing=new Set(entries.map(e=>e.observation_id));let published=0;
for(const trial of trials){
 const report=trial.report;if(report?.kind!=='observation_classification'||report.status!=='completed'||existing.has(report.observation_id))continue;
 const result=report.result,observation=observations.find(o=>o.id===report.observation_id),source=registry.find(s=>s.source_id===observation?.source_id);
 const town=source?.definition?.municipality,start=Date.parse(observation?.source_published_at??''),ageDays=(Date.now()-start)/86400000;
 const qualifies=result?.decision==='candidate'&&result.destination==='current_review'&&result.publication_status==='unpublished'&&
  source?.runtime_enabled&&source.verification_status==='api_parsed'&&source.last_check_result?.status==='parsed'&&
  source.definition?.endpoint_type==='calendar'&&towns.has(town)&&AI.test(result.ai_quote??'')&&
  report.input_text?.includes(result.ai_quote)&&result.local_basis?.trim()&&Number.isFinite(start)&&ageDays>=-365&&ageDays<=30;
 if(!qualifies)continue;
 await database('aq_entries',{method:'POST',body:{observation_id:observation.id,canonical_url:observation.url,title:observation.title,
  summary:result.reason,towns:[town],kind:'event',status:'published',local_evidence:result.local_basis,
  ai_evidence:result.ai_quote,starts_at:observation.source_published_at,published_at:new Date().toISOString()}});
 existing.add(observation.id);published++;
}
console.log(JSON.stringify({publicationPolicy:'official_upcoming_local_ai_events_v1',published}));
