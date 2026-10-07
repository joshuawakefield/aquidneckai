import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {cleanEnvironment,preflight} from './cloud-check.mjs';
// Keep direct invocation as secret-free as the full runner before probing the feed.
preflight();
const password='test-only-password-never-use-for-hosting';
const child=spawn(process.execPath,['scripts/production-server.mjs'],{env:{...cleanEnvironment(),PORT:'18787',AQAI_BIND_HOST:'127.0.0.1',AQAI_STAGING_PASSWORD:password,AQAI_WORKER_ENABLED:'false',AQAI_HEALTH_DB_CHECK:'false'},stdio:['ignore','pipe','pipe'],windowsHide:true});
let ready=false;
try{
 await Promise.race([once(child.stdout,'data').then(()=>ready=true),once(child,'exit').then(()=>{throw Error('Server failed to start');}),new Promise((_,reject)=>setTimeout(()=>reject(Error('Startup timeout')),10000).unref())]);
 assert.ok(ready);
 const get=(path,auth)=>fetch('http://127.0.0.1:18787'+path,{headers:auth?{Authorization:auth}:{}});
 const live=await get('/livez');assert.equal(live.status,200);assert.deepEqual(await live.json(),{status:'alive'});
 const health=await get('/healthz');assert.equal(health.status,200);
 const healthData=await health.json();assert.equal(healthData.lastCycle,null);
 // This is diagnostic bypass mode, not evidence that a database/worker is ready.
 assert.equal(healthData.enabledSources,0);assert.equal(healthData.status,'ok');
 for(const path of ['/','/admin','/favicon.svg','/robots.txt','/assets/missing.js','/api/aqai/status']){
  const response=await get(path);assert.equal(response.status,401,path);
  assert.match(response.headers.get('www-authenticate'),/^Basic /);
  assert.equal(response.headers.get('cache-control'),'no-store');
 }
 // With the secret-free runner the anonymous feed fails closed, not as an empty success.
 const feed=await get('/api/aqai/published');assert.equal(feed.status,503);
 assert.equal(feed.headers.get('www-authenticate'),null);
 assert.deepEqual(await feed.json(),{error:'Service temporarily unavailable'});
 assert.equal((await fetch('http://127.0.0.1:18787/api/aqai/published',{method:'POST'})).status,405);
 assert.equal((await get('/index-preview')).status,401);
 assert.equal((await get('/api/aqai/preview')).status,401);
 assert.equal((await get('/api/aqai/review')).status,401);
 assert.equal((await get('/api/aqai/evidence?id=11111111-1111-4111-8111-111111111111')).status,401);
 assert.equal((await get('/api/aqai/editorial?id=11111111-1111-4111-8111-111111111111')).status,401);
 assert.equal((await fetch('http://127.0.0.1:18787/api/aqai/editorial',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
 assert.equal((await get('/index-preview','Basic invalid')).status,401);
 const auth='Basic '+Buffer.from('aqai:'+password).toString('base64');
 const page=await get('/index-preview',auth);assert.equal(page.status,200);
 const html=await page.text();assert.match(html,/<html/);
 for(const path of ['/','/admin','/favicon.svg','/robots.txt'])assert.equal((await get(path,auth)).status,200,path);
 assert.equal(page.headers.get('x-robots-tag'),'noindex, nofollow');
 const asset=html.match(/src="(\/assets\/[^"]+\.js)"/)[1];
 assert.equal((await get(asset)).status,401);
 const script=await get(asset,auth);assert.equal(script.status,200);
 assert.equal(script.headers.get('cache-control'),'private, max-age=31536000, immutable');
 const head=await fetch('http://127.0.0.1:18787/admin',{method:'HEAD',headers:{Authorization:auth}});
 assert.equal(head.status,200);assert.equal(await head.text(),'');
 assert.equal((await get('/assets/missing.js',auth)).status,404);
 assert.equal((await get('/%2e%2e%2fscripts/production-server.mjs',auth)).status,404);
 assert.equal(page.headers.get('x-frame-options'),'DENY');assert.match(page.headers.get('content-security-policy'),/frame-ancestors 'none'/);
 assert.equal((await fetch('http://127.0.0.1:18787/api/aqai/editorial',{method:'POST',headers:{Authorization:auth,'Content-Type':'application/json'},body:'{}'})).status,403);
 assert.equal((await get('/.env.server.local',auth)).status,404);
 assert.equal((await get('/scripts/production-server.mjs',auth)).status,404);
 assert.equal((await get('/api/unknown',auth)).status,404);
 console.log('Production smoke tests passed: liveness, diagnostic bypass, anonymous feed failure, reader/admin/assets authentication, methods/cache/HEAD, SPA and path isolation. Worker disabled.');
}finally{child.kill();}
