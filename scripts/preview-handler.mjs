import {database} from './supabase-server.mjs';
import {assessmentExcerpt} from './assessment-text.mjs';
import {cachedRead} from './read-cache.mjs';
import {inferenceBudget} from './inference-budget.mjs';

export function createPreviewHandler(db=database){
 const summary=cachedRead(()=>db('rpc/aq_preview_summary',{method:'POST',body:{}}));
 return async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const respond=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:JSON.stringify(data));};
  try{
   if(url.pathname==='/api/aqai/preview'){const data=await summary();respond(200,{...data,inferenceBudget:inferenceBudget(data.inferenceBudget)});return;}
   if(url.pathname==='/api/aqai/review'){
    const decision=url.searchParams.get('decision')??'needs_review';
    const offset=Number(url.searchParams.get('offset')??0);
    if(!['all','needs_review','pending','reject','candidate'].includes(decision)||!Number.isSafeInteger(offset)||offset<0||offset>1000000){respond(400,{error:'Invalid review filter'});return;}
    respond(200,await db('rpc/aq_review_page',{method:'POST',body:{p_decision:decision,p_query:(url.searchParams.get('q')??'').slice(0,200),p_offset:offset,p_limit:25}}));return;
   }
   if(url.pathname==='/api/aqai/evidence'){
    const id=url.searchParams.get('id')??'';
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)){respond(400,{error:'Invalid item'});return;}
    const rows=await db('aq_observations?id=eq.'+id+'&select=evidence_excerpt&limit=1');
    respond(rows.length?200:404,rows.length?{excerpt:assessmentExcerpt(rows[0].evidence_excerpt)}:{error:'Item not found'});return;
   }
   respond(404,{error:'Not found'});
  }catch{respond(503,{error:'Database unavailable. Please retry.'});}
 };
}
export const previewHandler=createPreviewHandler();
