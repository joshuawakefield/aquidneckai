import {database} from './supabase-server.mjs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const actions=new Set(['note','approve','reject','withdraw']);
const fields=new Set(['id','expectedVersion','action','note','title','summary','aiQuote','usefulness','kind','towns','startsAt','endsAt']);
export function validEditorialInput(body){
 if(!body||Array.isArray(body)||typeof body!=='object'||Object.keys(body).some(k=>!fields.has(k)))return false;
 if(!uuid.test(body.id??'')||!Number.isSafeInteger(body.expectedVersion)||body.expectedVersion<0||body.expectedVersion>2147483646||!actions.has(body.action))return false;
 if(typeof body.note!=='string'||!body.note.trim())return false;
 for(const [key,max] of Object.entries({note:2000,title:300,summary:2000,aiQuote:1000,usefulness:2000,kind:30,startsAt:40,endsAt:40})){
  if(body[key]!==undefined&&body[key]!==null&&(typeof body[key]!=='string'||body[key].length>max))return false;
 }
 return body.towns===undefined||(Array.isArray(body.towns)&&body.towns.length<=10&&body.towns.every(t=>typeof t==='string'&&t.length<=80));
}
export function sameOrigin(req){
 try{
  const origin=new URL(req.headers.origin??'');
  return origin.origin===req.headers.origin&&origin.host===req.headers.host&&
   (origin.protocol==='https:'||(origin.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(origin.hostname)))&&req.headers['sec-fetch-site']!=='cross-site';
 }catch{return false;}
}
async function readJSON(req){
 const chunks=[];let bytes=0;
 for await(const chunk of req){const buffer=Buffer.from(chunk);bytes+=buffer.length;if(bytes>16000)throw Object.assign(Error('Request too large'),{status:413});chunks.push(buffer);}
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw Object.assign(Error('Invalid JSON'),{status:400});}
}
// Authentication is enforced by production-server before this handler is called.
export function createEditorialHandler(db=database){
 return async(req,res)=>{
  const respond=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:JSON.stringify(data));};
  try{
   if(req.method==='GET'||req.method==='HEAD'){
    const id=new URL(req.url,'http://localhost').searchParams.get('id');
    if(!uuid.test(id??'')){respond(400,{error:'Invalid item'});return;}
    const state=await db('rpc/aq_editorial_state',{method:'POST',body:{p_id:id}});
    respond(state?200:404,state??{error:'Item not found'});return;
   }
   if(req.method!=='POST'){respond(405,{error:'Method not allowed'});return;}
   if(!sameOrigin(req)){respond(403,{error:'Use the review dashboard on this site.'});return;}
   if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']??'')){respond(415,{error:'JSON required'});return;}
   const body=await readJSON(req);
   if(!validEditorialInput(body)){respond(400,{error:'Invalid editorial request'});return;}
   const result=await db('rpc/aq_save_editorial_review',{method:'POST',body:{p_review:body}});
   respond(result?.ok?200:(result?.status??503),result??{error:'Editorial save unavailable'});
  }catch(error){respond(error.status??503,{error:error.status?error.message:'Editorial save unavailable. Refresh the item before retrying.'});}
 };
}
export const editorialHandler=createEditorialHandler();
