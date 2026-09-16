import { allRows } from './supabase-server.mjs';
export async function previewHandler(req,res){
 if(req.method!=='GET'||req.url!=='/api/aqai/preview'){res.writeHead(404);res.end();return;}
 try{
  const [registry,observations,trials]=await Promise.all([
   allRows('aq_source_registry?select=source_id,organization,endpoint_url,definition,verification_status,runtime_enabled,last_checked_at,last_check_result&order=source_id'),
   allRows('aq_observations?select=id,source_id,title,url,source_published_at,observed_at&order=observed_at.desc,id.desc'),
   allRows('aq_classification_trials?select=request_id,report&order=request_id')]);
  const sources=registry.map(s=>({id:s.source_id,name:s.organization,url:s.endpoint_url,
   towns:Array.isArray(s.definition.municipality)?s.definition.municipality:[s.definition.municipality].filter(Boolean),
   kind:s.definition.endpoint_type,status:s.last_check_result?.status??'unchecked',
   checkedAt:s.last_checked_at,enabled:s.runtime_enabled,itemCount:s.last_check_result?.item_count??0}));
  const byObservation=new Map(trials.filter(t=>t.report.kind==='observation_classification').map(t=>[t.report.observation_id,t.report]));
  const seen=new Set();const items=[];
  for(const o of observations){const k=o.source_id+'|'+o.url;if(seen.has(k))continue;seen.add(k);
   const c=byObservation.get(o.id);if(c?.status!=='completed'||c.result.decision!=='candidate')continue;
   const source=sources.find(s=>s.id===o.source_id);
   items.push({id:o.id,title:o.title,url:o.url,source:source?.name,towns:source?.towns??[],date:o.source_published_at,
    destination:c.result.destination,decision:c.result.decision,aiEvidence:c.result.ai_quote,
    localEvidence:c.result.local_basis,reason:c.result.reason,status:'unpublished'});
  }
  const completed=[...byObservation.values()].filter(c=>c.status==='completed').length;
  res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
  res.end(JSON.stringify({fetchedAt:new Date().toISOString(),sources,items,observations:observations.length,classified:completed,classificationPending:observations.length-completed}));
 }catch{res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:'Database unavailable. Please retry.'}));}
}
