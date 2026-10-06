import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash,timingSafeEqual} from 'node:crypto';
import {spawn} from 'node:child_process';
import {previewHandler} from './preview-handler.mjs';
import {database} from './supabase-server.mjs';
import {createHealthSummary,sourceHealthDegraded} from './health-summary.mjs';
import {createPublishedFeed} from './published-feed.mjs';
import {editorialHandler} from './editorial-handler.mjs';

const password=process.env.AQAI_STAGING_PASSWORD;
if(!password||password.length<24)throw Error('Set AQAI_STAGING_PASSWORD to at least 24 characters');
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const digest=s=>createHash('sha256').update(s).digest();
const expected=digest('Basic '+Buffer.from('aqai:'+password).toString('base64'));
const sourceCatalogDigest=createHash('sha256').update(await readFile(new URL('./source-catalog.json',import.meta.url))).digest('hex').slice(0,16);
const workerEnabled=process.env.AQAI_WORKER_ENABLED==='true';
const healthDbCheck=process.env.AQAI_HEALTH_DB_CHECK!=='false';
const healthSummary=createHealthSummary(database);
const publishedItems=createPublishedFeed(database);
const startedAt=Date.now();
let stopping=false,active=null,timer=null,lastCycle=null,cycleFailed=false,lastFailureAt=null;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('X-Frame-Options','DENY');
 res.setHeader('Content-Security-Policy',"frame-ancestors 'none'");
 res.setHeader('X-Robots-Tag','noindex, nofollow');
 res.setHeader('Cache-Control','no-store');
 try{
  const path=new URL(req.url,'http://localhost').pathname;
  if(req.method!=='GET'&&req.method!=='HEAD'&&!(path==='/api/aqai/editorial'&&req.method==='POST')){res.writeHead(405);res.end();return;}
  // Container liveness is separate from upstream-source/readiness diagnostics.
  if(path==='/livez'){res.writeHead(stopping?503:200,{'Content-Type':'application/json'});res.end(JSON.stringify({status:stopping?'stopping':'alive'}));return;}
  if(path==='/healthz'){
   const stale=workerEnabled&&((lastCycle&&Date.now()-lastCycle>900000)||(!lastCycle&&Date.now()-startedAt>900000));
   const recentFailure=lastFailureAt&&Date.now()-lastFailureAt<86400000;
   const summary=healthDbCheck?await healthSummary():{enabledSources:0,eligibleSources:0,waitingSources:0};
   const degraded=stopping||cycleFailed||stale||recentFailure||(healthDbCheck&&(!workerEnabled||sourceHealthDegraded(summary)));
   res.writeHead(degraded?503:200,{'Content-Type':'application/json'});
   res.end(JSON.stringify({status:degraded?'degraded':'ok',collectorVersion:'source-expansion-v1',sourceCatalogDigest,enabledSources:summary.enabledSources,eligibleSources:summary.eligibleSources,waitingSources:summary.waitingSources,failedSources:summary.failedSources??0,sourceHealthCheckedAt:summary.checkedAt??null,lastCycle:lastCycle?new Date(lastCycle).toISOString():null}));return;
  }
  if(path==='/api/aqai/published'){
   const publications=await publishedItems();
   res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'public, max-age=30, s-maxage=60'});res.end(req.method==='HEAD'?undefined:JSON.stringify(publications));return;
  }
  if(!timingSafeEqual(expected,digest(req.headers.authorization??''))){
   res.writeHead(401,{'WWW-Authenticate':'Basic realm="AqAI staging", charset="UTF-8"'});res.end('Private AqAI staging');return;
  }
  if(path==='/api/aqai/editorial'){await editorialHandler(req,res);return;}
  if(['/api/aqai/preview','/api/aqai/review','/api/aqai/evidence'].includes(path)){await previewHandler(req,res);return;}
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
  const bytes=await readFile(target);res.writeHead(200,{'Content-Type':mime[extname(target)]??'application/octet-stream',
   'Cache-Control':path.startsWith('/assets/')?'private, max-age=31536000, immutable':'no-store'});res.end(req.method==='HEAD'?undefined:bytes);
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
 if(stopping)return;
 stopping=true;clearTimeout(timer);
 let webClosed=false,workerClosed=!active;
 const finish=()=>{if(webClosed&&workerClosed)process.exit(0);};
 if(active){active.once('close',()=>{workerClosed=true;finish();});active.kill('SIGTERM');}
 server.close(()=>{webClosed=true;finish();});
 setTimeout(()=>{active?.kill('SIGKILL');process.exit(1);},10000).unref();
});
server.listen(Number(process.env.PORT??8080),process.env.AQAI_BIND_HOST??'0.0.0.0',()=>{
 console.log(JSON.stringify({web:'listening',workerEnabled}));if(workerEnabled)cycle();
});
