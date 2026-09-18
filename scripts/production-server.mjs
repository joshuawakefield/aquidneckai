import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash,timingSafeEqual} from 'node:crypto';
import {spawn} from 'node:child_process';
import {previewHandler} from './preview-handler.mjs';
import {database,allRows} from './supabase-server.mjs';
import {sourceEligible} from './source-readiness.mjs';

const password=process.env.AQAI_STAGING_PASSWORD;
if(!password||password.length<24)throw Error('Set AQAI_STAGING_PASSWORD to at least 24 characters');
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const digest=s=>createHash('sha256').update(s).digest();
const expected=digest('Basic '+Buffer.from('aqai:'+password).toString('base64'));
const workerEnabled=process.env.AQAI_WORKER_ENABLED==='true';
const healthDbCheck=process.env.AQAI_HEALTH_DB_CHECK!=='false';
const startedAt=Date.now();
let stopping=false,active=null,timer=null,lastCycle=null,cycleFailed=false,lastFailureAt=null;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('X-Robots-Tag','noindex, nofollow');
 res.setHeader('Cache-Control','no-store');
 try{
  const path=new URL(req.url,'http://localhost').pathname;
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
  if(path==='/healthz'){
   const stale=workerEnabled&&((lastCycle&&Date.now()-lastCycle>900000)||(!lastCycle&&Date.now()-startedAt>900000));
   const recentFailure=lastFailureAt&&Date.now()-lastFailureAt<86400000;
   const sources=healthDbCheck?await allRows('aq_source_registry?runtime_enabled=eq.true&select=source_id,runtime_enabled,definition,verification_status,last_checked_at,last_check_result,next_check_at,lease_until&order=source_id'):[];
   const eligible=sources.filter(sourceEligible);
   const sourceFailure=eligible.some(s=>s.last_check_result?.status==='failed');
   const overdue=eligible.some(s=>s.next_check_at&&Date.now()-Date.parse(s.next_check_at)>900000);
   const degraded=stopping||cycleFailed||stale||recentFailure||sourceFailure||(healthDbCheck&&(!workerEnabled||!eligible.length||overdue));
   res.writeHead(degraded?503:200,{'Content-Type':'application/json'});
   res.end(JSON.stringify({status:degraded?'degraded':'ok',collectorVersion:'expanded-rss-v1',enabledSources:sources.length,eligibleSources:eligible.length,waitingSources:sources.length-eligible.length,lastCycle:lastCycle?new Date(lastCycle).toISOString():null}));return;
  }
  if(path==='/api/aqai/published'){
   const items=await allRows('aq_entries?status=eq.published&select=id,canonical_url,title,summary,towns,kind,starts_at,ends_at,published_at&order=starts_at.asc,id.asc');
   res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({items}));return;
  }
  if(!timingSafeEqual(expected,digest(req.headers.authorization??''))){
   res.writeHead(401,{'WWW-Authenticate':'Basic realm="AqAI staging", charset="UTF-8"'});res.end('Private AqAI staging');return;
  }
  if(path==='/api/aqai/preview'){await previewHandler(req,res);return;}
  if(path==='/api/aqai/status'){
   await database('aq_source_registry?select=source_id&limit=1');
   res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({workerEnabled,lastCycle,cycleFailed,running:!!active}));return;
  }
  if(path.startsWith('/api/')){res.writeHead(404);res.end();return;}
  const file=resolve(root,'.'+decodeURIComponent(path));
  if(file!==resolve(root)&&!file.startsWith(resolve(root)+sep)){res.writeHead(404);res.end();return;}
  let target=file;
  try{if(!(await stat(target)).isFile())target=resolve(root,'index.html');}catch{target=resolve(root,'index.html');}
  // Only serve the build directory; unknown asset paths are never a SPA fallback.
  if(target.endsWith('index.html')&&extname(path)&&extname(path)!=='.html'){res.writeHead(404);res.end();return;}
  const bytes=await readFile(target);res.writeHead(200,{'Content-Type':mime[extname(target)]??'application/octet-stream'});res.end(req.method==='HEAD'?undefined:bytes);
 }catch{res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Service temporarily unavailable'}));}
});
function cycle(){
 if(stopping)return;
 active=spawn(process.execPath,[fileURLToPath(new URL('run-cycle.mjs',import.meta.url))],{stdio:'inherit',windowsHide:true});
 const deadline=setTimeout(()=>{cycleFailed=true;active?.kill('SIGTERM');},600000);
 active.on('error',()=>{cycleFailed=true;});
 active.on('close',code=>{clearTimeout(deadline);active=null;lastCycle=Date.now();cycleFailed=code!==0;if(cycleFailed)lastFailureAt=lastCycle;
  console.log(JSON.stringify({cycleFinished:new Date(lastCycle).toISOString(),success:!cycleFailed}));
  if(!stopping)timer=setTimeout(cycle,300000);
 });
}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{
 stopping=true;clearTimeout(timer);active?.kill('SIGTERM');server.close(()=>process.exit(0));
 setTimeout(()=>process.exit(1),10000).unref();
});
server.listen(Number(process.env.PORT??8080),process.env.AQAI_BIND_HOST??'0.0.0.0',()=>{
 console.log(JSON.stringify({web:'listening',workerEnabled}));if(workerEnabled)cycle();
});
