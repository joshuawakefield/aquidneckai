// Initial automatic publication policy: official, upcoming local AI calendar events only.
import {database} from './supabase-server.mjs';
import {explicitCalendarCancellation} from './calendar-signals.mjs';
const AI=/\b(?:AI|artificial intelligence|machine learning|ChatGPT|generative AI|large language models?|LLMs?|neural networks?)\b/i;
const towns=new Set(['Newport','Middletown','Portsmouth']);
let published=0,cursor='';
while(true){
 const trials=await database('rpc/aq_publication_candidates',{method:'POST',body:{p_after:cursor,p_limit:80}});
 if(!trials.length)break;
 for(const trial of trials){
 const {report,observation,source}=trial;const result=report.result;
 const town=source?.definition?.municipality,start=Date.parse(observation?.source_published_at??''),ageDays=(Date.now()-start)/86400000;
 const qualifies=result?.decision==='candidate'&&result.destination==='current_review'&&result.publication_status==='unpublished'&&
  source?.runtime_enabled&&source.verification_status==='api_parsed'&&source.last_check_result?.status==='parsed'&&
  source.definition?.endpoint_type==='calendar'&&towns.has(town)&&AI.test(result.ai_quote??'')&&
  report.input_text?.includes(result.ai_quote)&&result.local_basis?.trim()&&Number.isFinite(start)&&ageDays>=-365&&ageDays<=30&&
  !explicitCalendarCancellation(observation?.title);
 if(!qualifies)continue;
 try{await database('aq_entries',{method:'POST',body:{observation_id:observation.id,canonical_url:observation.url,title:observation.title,
  summary:result.reason,towns:[town],kind:'event',status:'published',local_evidence:result.local_basis,
  ai_evidence:result.ai_quote,starts_at:observation.source_published_at,published_at:new Date().toISOString()}});
  published++;
 }catch(error){if(!error.message.includes('HTTP 409'))throw error;}
 }
 cursor=trials.at(-1).request_id;
 if(trials.length<80)break;
}
console.log(JSON.stringify({publicationPolicy:'official_upcoming_local_ai_events_v1',published}));
