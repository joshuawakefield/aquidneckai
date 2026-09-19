import { allRows } from './supabase-server.mjs';
import {sourceEligible} from './source-readiness.mjs';
import {plainText} from './assessment-text.mjs';
export async function previewHandler(req,res){
 if(req.method!=='GET'||req.url!=='/api/aqai/preview'){res.writeHead(404);res.end();return;}
 try{
  const [registry,observations,trials,entries]=await Promise.all([
   allRows('aq_source_registry?select=source_id,organization,endpoint_url,definition,verification_status,runtime_enabled,last_checked_at,last_check_result&order=source_id'),
   allRows('aq_observations?select=id,source_id,title,url,evidence_excerpt,source_published_at,observed_at&order=observed_at.desc,id.desc'),
   allRows('aq_classification_trials?select=request_id,report&order=request_id'),
   allRows('aq_entries?select=observation_id,status,kind,starts_at,ends_at,published_at&order=created_at')]);
  const sources=registry.map(s=>({id:s.source_id,name:s.organization,url:s.endpoint_url,
   towns:Array.isArray(s.definition.municipality)?s.definition.municipality:[s.definition.municipality].filter(Boolean),
   kind:s.definition.endpoint_type,status:s.last_check_result?.status??'unchecked',
   checkedAt:s.last_checked_at,enabled:s.runtime_enabled,collecting:sourceEligible(s),itemCount:s.last_check_result?.item_count??0}));
  const byObservation=new Map(trials.filter(t=>t.report.kind==='observation_classification').map(t=>[t.report.observation_id,t.report]));
  const seen=new Set();const items=[];
  for(const o of observations){const k=o.source_id+'|'+o.url;if(seen.has(k))continue;seen.add(k);
   const c=byObservation.get(o.id);if(c?.status!=='completed'||c.result.decision!=='candidate')continue;
   const source=sources.find(s=>s.id===o.source_id);
   const entry=entries.find(e=>e.observation_id===o.id);
   items.push({id:o.id,title:o.title,url:o.url,source:source?.name,towns:source?.towns??[],date:o.source_published_at,
    destination:c.result.destination,decision:c.result.decision,aiEvidence:c.result.ai_quote,
    localEvidence:c.result.local_basis,reason:c.result.reason,status:entry?.status??'unpublished',kind:entry?.kind??null,
    startsAt:entry?.starts_at??null,endsAt:entry?.ends_at??null,publishedAt:entry?.published_at??null});
  }
  const reviewItems=observations.map(o=>{const c=byObservation.get(o.id),source=sources.find(s=>s.id===o.source_id);return {
   id:o.id,title:o.title,url:o.url,source:source?.name,date:o.source_published_at,
   excerpt:plainText(o.evidence_excerpt).slice(0,6000),
   decision:c?.status==='completed'?c.result?.decision:'pending',
   issue:c?.assessment_issue??null,reason:c?.result?.reason??'Awaiting assessment',
   aiEvidence:c?.result?.ai_quote??'',localEvidence:c?.result?.local_basis??'',
   modelDecision:c?.model_result?.decision??null,modelReason:c?.model_result?.reason??null,
   status:c?.status??'unassessed',destination:c?.result?.destination??null,
  };});
  const completed=[...byObservation.values()].filter(c=>c.status==='completed').length;
  res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
  res.end(JSON.stringify({fetchedAt:new Date().toISOString(),sources,items,reviewItems,reviewRequired:reviewItems.filter(i=>i.decision==='needs_review').length,observations:observations.length,classified:completed,classificationPending:observations.length-completed}));
 }catch{res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:'Database unavailable. Please retry.'}));}
}
