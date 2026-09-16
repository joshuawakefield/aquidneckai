// Scheduled mode obeys runtime_enabled; --pilot is an explicit bounded one-off.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { database } from './supabase-server.mjs';
import { normalizeResult } from './collector-policy.mjs';
const pilot=process.argv.includes('--pilot');
function fetchSource(source){return new Promise(resolve=>{
 const workerEnv={...process.env,PYTHONIOENCODING:'utf-8'};
 delete workerEnv.OPENROUTER_API_KEY; delete workerEnv.SUPABASE_SECRET_KEY; delete workerEnv.AQAI_STAGING_PASSWORD;
 const child=spawn(process.env.PYTHON_BINARY??'python',[fileURLToPath(new URL('fetch-source.py',import.meta.url))],
  {stdio:['pipe','pipe','pipe'],windowsHide:true,env:workerEnv});
 let out='';const timer=setTimeout(()=>child.kill(),55000);
 child.stdout.on('data',chunk=>{out+=chunk;if(out.length>4000000)child.kill();});
 child.stderr.resume(); // Never echo subprocess errors or environment details.
 child.on('error',()=>{clearTimeout(timer);resolve({status:'failed',error_type:'WorkerUnavailable'});});
 child.on('close',code=>{clearTimeout(timer);try{resolve(code===0?JSON.parse(out):{status:'failed',error_type:'WorkerFailed'});}catch{resolve({status:'failed',error_type:'InvalidWorkerResponse'});}});
 child.stdin.on('error',()=>{});child.stdin.end(JSON.stringify({source_id:source.source_id,endpoint_url:source.endpoint_url}));
});}
try{
 const sources=await database('rpc/aq_claim_feed_sources',{method:'POST',body:{p_pilot:pilot}});
 console.log(JSON.stringify({mode:pilot?'one_off_pilot':'scheduled',claimed:sources.length}));
 for(const source of sources){
  let result;
  try{result=normalizeResult(await fetchSource(source));}catch{result={status:'failed',error_type:'ValidationFailed'};}
  const saved=await database('rpc/aq_finish_feed_run',{method:'POST',body:{p_source_id:source.source_id,p_lease_token:source.lease_token,p_result:result}});
  console.log(JSON.stringify({source_id:source.source_id,...saved}));
  if(saved.status==='failed')process.exitCode=1;
 }
}catch(e){console.error(e.message);process.exitCode=1;}
