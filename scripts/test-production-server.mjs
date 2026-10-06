import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {once} from 'node:events';
const password='test-only-password-never-use-for-hosting';
const child=spawn(process.execPath,['scripts/production-server.mjs'],{env:{...process.env,PORT:'18787',AQAI_BIND_HOST:'127.0.0.1',AQAI_STAGING_PASSWORD:password,AQAI_WORKER_ENABLED:'false',AQAI_HEALTH_DB_CHECK:'false'},stdio:['ignore','pipe','pipe'],windowsHide:true});
let ready=false;
try{
 await Promise.race([once(child.stdout,'data').then(()=>ready=true),once(child,'exit').then(()=>{throw Error('Server failed to start');}),new Promise((_,reject)=>setTimeout(()=>reject(Error('Startup timeout')),10000).unref())]);
 assert.ok(ready);
 const get=(path,auth)=>fetch('http://127.0.0.1:18787'+path,{headers:auth?{Authorization:auth}:{}});
 assert.equal((await get('/healthz')).status,200);
 assert.equal((await get('/index-preview')).status,401);
 assert.equal((await get('/api/aqai/preview')).status,401);
 assert.equal((await get('/api/aqai/review')).status,401);
 assert.equal((await get('/api/aqai/evidence?id=11111111-1111-4111-8111-111111111111')).status,401);
 assert.equal((await get('/api/aqai/editorial?id=11111111-1111-4111-8111-111111111111')).status,401);
 assert.equal((await fetch('http://127.0.0.1:18787/api/aqai/editorial',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
 assert.equal((await get('/index-preview','Basic invalid')).status,401);
 const auth='Basic '+Buffer.from('aqai:'+password).toString('base64');
 const page=await get('/index-preview',auth);assert.equal(page.status,200);assert.match(await page.text(),/<html/);
 assert.equal(page.headers.get('x-frame-options'),'DENY');assert.match(page.headers.get('content-security-policy'),/frame-ancestors 'none'/);
 assert.equal((await fetch('http://127.0.0.1:18787/api/aqai/editorial',{method:'POST',headers:{Authorization:auth,'Content-Type':'application/json'},body:'{}'})).status,403);
 assert.equal((await get('/.env.server.local',auth)).status,404);
 assert.equal((await get('/scripts/production-server.mjs',auth)).status,404);
 assert.equal((await get('/api/unknown',auth)).status,404);
 console.log('Production smoke tests passed: health, authentication, SPA, secret/source path isolation. Worker disabled.');
}finally{child.kill();}
