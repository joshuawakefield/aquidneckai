import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdtemp,mkdir,writeFile,readFile,cp,rm,symlink,unlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {publicReaderEnabled,canonicalRequestPath,readerAssetPaths,createPublicReaderPolicy} from './public-reader-policy.mjs';
import {cleanEnvironment,preflight} from './cloud-check.mjs';

preflight();
const password='fixture-only-not-a-hosted-password';
const auth='Basic '+Buffer.from('aqai:'+password).toString('base64');
const manifest=()=>({
 'index.html':{file:'assets/reader-test.js',isEntry:true,imports:['_shared.js'],css:['assets/reader-test.css'],dynamicImports:['src/pages/IndexPreview.tsx']},
 '_shared.js':{file:'assets/shared-test.js'},
 'src/pages/IndexPreview.tsx':{file:'assets/private-test.js',isDynamicEntry:true,css:['assets/private-test.css'],imports:['_shared.js']},
});
const badPaths=['/../','/admin/../','/assets/../','/./','//','//admin','/assets//reader-test.js',
 '/%2e%2e/','/%2e/','/%2E%2E%2F','/assets/%2e%2e/%2e%2e/api/aqai/status',
 '/%252e%252e%252f','/assets%2freader-test.js','/assets%5creader-test.js','/assets\\reader-test.js',
 '/api\\aqai\\published','/api/aqai/%70ublished','/%61dmin','/assets/reader-test.js%00',
 '/%','/%GG','/%C0%AF','/%E0%A4%A','/assets/reader-test.js;anything','http://localhost/',
 '/?fragment=#admin','/a\t','/a\u007f'];
const privatePaths=['/admin','/admin/','/index-preview','/index.html','/unknown','/story/one',
 '/api','/api/unknown','/api/aqai/preview','/api/aqai/review','/api/aqai/evidence',
 '/api/aqai/editorial','/api/aqai/status','/api/aqai/published/','/api/aqai/published.json',
 '/API/aqai/published','/assets/private-test.js','/assets/private-test.css','/assets/unknown.js',
 '/assets/reader-test.js.map','/.vite/manifest.json','/.env.server.local','/scripts/production-server.mjs',
 '/robots.txt','/favicon.ico','/placeholder.svg'];
const publicFiles=['/','/favicon.svg','/assets/reader-test.js','/assets/reader-test.css','/assets/shared-test.js'];

// Real production server + copied runtime modules in a disposable fixture tree.
// Replacing only the DB adapter here gives successful/error HTTP feed coverage
// without a production fixture switch, credentials, provider or external socket.
async function fixture(t,{value,broken,failFeed=false,buildRoot,stagingPassword=password}={}){
 const dir=await mkdtemp(join(tmpdir(),'aq029-'));
 t.after(()=>rm(dir,{recursive:true,force:true}));
 await cp(new URL('.',import.meta.url),join(dir,'scripts'),{recursive:true});
 await writeFile(join(dir,'scripts/supabase-server.mjs'),`
 import {appendFile} from 'node:fs/promises';
 export async function database(path){
  await appendFile(new URL('../calls.log',import.meta.url),path+'\\n');
  if(${failFeed})throw Error('fixture-private-backend-detail');
  if(!path.startsWith('aq_entries?'))throw Error('Unexpected private fixture request');
  return [{id:'fixture-publication',title:'Fixture public title',kind:'news',status:'published',published_at:new Date().toISOString(),review_notes:'fixture-private-note',secret:'fixture-private-secret'},
   {id:'fixture-draft',kind:'news',status:'candidate',published_at:new Date().toISOString()}];
 }
 `);
 const root=join(dir,'dist');
 if(buildRoot)await cp(buildRoot,root,{recursive:true});
 else{
  await mkdir(join(root,'assets'),{recursive:true});await mkdir(join(root,'.vite'));
  await writeFile(join(root,'index.html'),'<html>fixture reader</html>');
  await writeFile(join(root,'favicon.svg'),'<svg></svg>');
  for(const file of ['reader-test.js','reader-test.css','shared-test.js'])await writeFile(join(root,'assets',file),'/* fixture reader bytes */');
  for(const file of ['private-test.js','private-test.css'])await writeFile(join(root,'assets',file),'/* fixture private workspace */');
  await writeFile(join(root,'.vite/manifest.json'),JSON.stringify(manifest()));
 }
 if(broken)await broken(root,dir);
 const env={...cleanEnvironment(),PORT:'0',AQAI_BIND_HOST:'127.0.0.1',AQAI_STAGING_PASSWORD:stagingPassword};
 if(value!==undefined)env.AQAI_PUBLIC_READER_ENABLED=value;
 const child=spawn(process.execPath,[join(dir,'scripts/production-server.mjs')],{env,stdio:['ignore','pipe','pipe']});
 let stderr='';child.stderr.on('data',chunk=>stderr+=chunk);
 const exited=once(child,'exit');
 t.after(async()=>{if(child.exitCode===null&&child.signalCode===null){child.kill();await exited;}});
 const result=await Promise.race([
  once(child.stdout,'data').then(([data])=>({port:JSON.parse(data).port})),
  exited.then(([code])=>({code,stderr})),
  new Promise((_,reject)=>setTimeout(()=>reject(Error('Fixture startup timeout')),10000).unref()),
 ]);
 const request=(path,{method='GET',authorization}={})=>new Promise((resolve,reject)=>{
  const req=http.request({host:'127.0.0.1',port:result.port,path,method,agent:false,headers:authorization?{Authorization:authorization}:{}},res=>{
   const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks).toString()}));
  });req.on('error',reject);req.setTimeout(3000,()=>req.destroy(Error('Request timeout')));req.end();
 });
 return {...result,request,root,dir,calls:async()=>readFile(join(dir,'calls.log'),'utf8').catch(e=>{if(e.code==='ENOENT')return '';throw e;})};
}
function privateResponse(response,status=401){
 assert.equal(response.status,status);assert.equal(response.headers['cache-control'],'no-store');
 assert.equal(response.headers.vary,'Authorization');
 assert.match(response.headers['www-authenticate'],/^Basic realm="AqAI staging"/);
 assert.ok(!response.body.includes('fixture-private'));
}

test('only absent/false disables and exact true enables; malformed flags are rejected without echo',()=>{
 assert.equal(publicReaderEnabled(),false);assert.equal(publicReaderEnabled('false'),false);assert.equal(publicReaderEnabled('true'),true);
 for(const value of ['',null,false,true,0,1,'1','0','TRUE','False',' true','false ','fixture-secret']){
  assert.throws(()=>publicReaderEnabled(value),{message:'AQAI_PUBLIC_READER_ENABLED must be absent, false or true'});
 }
});
test('raw paths reject normalization and encoding ambiguities; queries cannot alter admission',()=>{
 for(const path of badPaths)assert.equal(canonicalRequestPath(path),null,path);
 for(const path of ['/','/admin','/api/aqai/published','/assets/reader-test.js']){
  assert.equal(canonicalRequestPath(path+'?next=/admin&path=%2fapi%2faqai%2fstatus'),path);
 }
});
test('manifest admits only static reader graph; private lazy chunks and extra files stay out',()=>{
 assert.deepEqual([...readerAssetPaths(manifest())].sort(),publicFiles.filter(p=>p!=='/').sort());
 const cyclic=manifest();cyclic['_shared.js'].imports=['index.html'];
 assert.deepEqual(readerAssetPaths(cyclic),readerAssetPaths(manifest()));
});
test('malformed manifests, private static imports, traversal and non-reader asset types fail closed',()=>{
 for(const value of [null,[],{},'text',{'index.html':{file:'assets/r.js'}}])assert.throws(()=>readerAssetPaths(value));
 const mutations=[m=>m['index.html'].imports.push('missing'),m=>m['index.html'].imports.push('src/pages/IndexPreview.tsx'),
  m=>m['index.html'].css='assets/r.css',m=>m['index.html'].imports=[null],m=>m['index.html'].assets=[{}],
  m=>m['index.html'].css=['assets/private-test.js'],m=>m['index.html'].assets=['assets/private-test.js'],m=>m['index.html'].file='assets/r.css'];
 for(const file of ['../private.js','/assets/r.js','api/aqai/status','assets/../private.js','assets/r.js.map','assets/export.json','assets/.env','assets/x%2ejs','assets/nested/r.js'])mutations.push(m=>m['index.html'].file=file);
 for(const mutate of mutations){const m=manifest();mutate(m);assert.throws(()=>readerAssetPaths(m));}
});
for(const value of [undefined,'false'])test(`default boundary remains private (flag ${String(value)})`,async t=>{
 const f=await fixture(t,{value,broken:root=>rm(join(root,'.vite'),{recursive:true})});
 assert.ok(f.port,'disabled mode needs no manifest');
 for(const path of [...publicFiles,...privatePaths])for(const method of ['GET','HEAD'])privateResponse(await f.request(path,{method}));
 const page=await f.request('/admin',{authorization:auth});assert.equal(page.status,200);assert.match(page.body,/fixture reader/);
 const asset=await f.request('/assets/private-test.js',{authorization:auth});assert.equal(asset.status,200);assert.equal(asset.headers['cache-control'],'private, max-age=31536000, immutable');
 assert.equal(await f.calls(),'');
});
test('enabled loopback permits only reader GET/HEAD and exact static graph, with safe query/cache/auth behavior',async t=>{
 const f=await fixture(t,{value:'true'});assert.ok(f.port);
 for(const path of publicFiles)for(const method of ['GET','HEAD'])for(const authorization of [undefined,auth,'Basic invalid']){
  const r=await f.request(path+'?route=/admin&file=%2fapi%2faqai%2fstatus',{method,authorization});
  assert.equal(r.status,200,path);assert.equal(r.headers['cache-control'],'no-store');assert.equal(r.headers.vary,'Authorization');
  assert.equal(r.headers['www-authenticate'],undefined);assert.equal(r.headers['x-robots-tag'],'noindex, nofollow');
  assert.equal(r.headers['x-content-type-options'],'nosniff');assert.equal(r.headers['x-frame-options'],'DENY');
  assert.match(r.headers['content-security-policy'],/frame-ancestors 'none'/);
  if(method==='HEAD')assert.equal(r.body,'');else assert.ok(r.body.length>0);
 }
 for(const path of privatePaths)for(const method of ['GET','HEAD']){
  privateResponse(await f.request(path,{method}));privateResponse(await f.request(path+'?public=true',{method,authorization:'Basic invalid'}));
 }
 assert.equal(await f.calls(),'','anonymous private paths must not invoke the adapter');
 for(const path of ['/admin','/index-preview','/assets/private-test.js','/assets/private-test.css'])assert.equal((await f.request(path,{authorization:auth})).status,200,path);
 for(const path of ['/api','/api/unknown','/assets/unknown.js','/.env.server.local','/scripts/production-server.mjs']){
  const r=await f.request(path,{authorization:auth});assert.equal(r.status,404,path);assert.equal(r.headers['cache-control'],'no-store');
 }
});
test('traversal, encoded routes, absolute targets and alternate methods never reach files or DB',async t=>{
 const f=await fixture(t,{value:'true'});
 // Raw http.request preserves paths; fetch would normalize dot segments away.
 for(const path of badPaths.filter(p=>!/[\t\x7f]/.test(p)))for(const authorization of [undefined,auth]){
  const r=await f.request(path,{authorization});assert.equal(r.status,404,path);assert.equal(r.headers['cache-control'],'no-store');assert.equal(r.body,'');
 }
 for(const path of [...publicFiles,...privatePaths,'/api/aqai/published','/livez','/healthz'])for(const method of ['POST','PUT','PATCH','DELETE','OPTIONS','TRACE']){
  const r=await f.request(path,{method});
  if(path==='/api/aqai/editorial'&&method==='POST')privateResponse(r);
  else {assert.equal(r.status,405,method+' '+path);assert.equal(r.headers['cache-control'],'no-store');}
 }
 const editorial=await f.request('/api/aqai/editorial',{method:'POST',authorization:auth});assert.equal(editorial.status,403);
 assert.equal(await f.calls(),'');
});
for(const value of [undefined,'true'])test(`existing public feed/health contract stays narrow in flag ${String(value)}`,async t=>{
 const f=await fixture(t,{value});
 for(const path of ['/livez','/healthz'])for(const method of ['GET','HEAD']){
  const r=await f.request(path,{method});assert.equal(r.status,200);assert.equal(r.headers['cache-control'],'no-store');
  if(method==='HEAD')assert.equal(r.body,'');
 }
 for(const method of ['GET','HEAD'])for(const authorization of [undefined,auth]){
  const r=await f.request('/api/aqai/published?select=*&status=eq.candidate',{method,authorization});assert.equal(r.status,200);
  assert.equal(r.headers['cache-control'],'public, max-age=30, s-maxage=60');assert.equal(r.headers['www-authenticate'],undefined);
  if(method==='HEAD')assert.equal(r.body,'');else{
   const body=JSON.parse(r.body);assert.equal(body.items.length,1);assert.equal(body.pastEvents.length,0);
   assert.deepEqual(Object.keys(body.items[0]).sort(),['id','title','kind','published_at'].sort());
   assert.ok(!r.body.includes('fixture-private'));assert.ok(!r.body.includes('fixture-draft'));
  }
 }
 const calls=(await f.calls()).trim().split('\n');assert.equal(calls.length,3,'bounded/coalesced feed cache');
 assert.ok(calls.every(path=>path.includes('status=eq.published')&&!path.includes('select=*')));
});
test('upstream failure is generic no-store 503, including HEAD; no backend details escape',async t=>{
 const f=await fixture(t,{value:'true',failFeed:true});
 for(const method of ['GET','HEAD']){
  const r=await f.request('/api/aqai/published',{method});assert.equal(r.status,503);assert.equal(r.headers['cache-control'],'no-store');
  assert.equal(r.headers['www-authenticate'],undefined);assert.equal(r.body,method==='HEAD'?'':JSON.stringify({error:'Service temporarily unavailable'}));
 }
});
test('removed public files and symlink swaps fail without SPA or private-byte fallback',async t=>{
 const f=await fixture(t,{value:'true'});
 await unlink(join(f.root,'assets/reader-test.js'));
 assert.equal((await f.request('/assets/reader-test.js')).status,404);
 await symlink(join(f.root,'assets/private-test.js'),join(f.root,'assets/reader-test.js'));
 assert.equal((await f.request('/assets/reader-test.js')).status,404);
 await unlink(join(f.root,'index.html'));
 assert.equal((await f.request('/')).status,404);
 assert.equal(await f.calls(),'');
});
test('invalid flag fails startup without echoing the supplied value',async t=>{
 const f=await fixture(t,{value:'fixture-secret'});assert.equal(f.code,1);assert.ok(!f.port);assert.ok(!f.stderr.includes('fixture-secret'));
});
test('opt-in still requires a strong staging credential before the server listens',async t=>{
 for(const stagingPassword of ['', 'short']){
  const f=await fixture(t,{value:'true',stagingPassword});assert.equal(f.code,1);assert.ok(!f.port);
  assert.match(f.stderr,/Set AQAI_STAGING_PASSWORD to at least 24 characters/);
 }
});
test('disabling the flag restores reader and asset auth with the same artifact',async t=>{
 const enabled=await fixture(t,{value:'true'});assert.equal((await enabled.request('/')).status,200);
 const disabled=await fixture(t,{value:'false',buildRoot:enabled.root});
 for(const path of publicFiles)privateResponse(await disabled.request(path));
 assert.equal((await disabled.request('/api/aqai/published')).status,200,'pre-existing anonymous feed is unchanged');
});
for(const problem of ['missing manifest','malformed manifest','missing asset','symlink outside','symlink private'])test(`enabled startup rejects ${problem}`,async t=>{
 const f=await fixture(t,{value:'true',broken:async(root,dir)=>{
  if(problem==='missing manifest')await unlink(join(root,'.vite/manifest.json'));
  if(problem==='malformed manifest')await writeFile(join(root,'.vite/manifest.json'),'{fixture-private-invalid');
  if(problem==='missing asset')await unlink(join(root,'assets/reader-test.js'));
  if(problem.startsWith('symlink')){
   await unlink(join(root,'assets/reader-test.js'));
   await writeFile(join(dir,'outside.js'),'fixture-private-outside');
   await symlink(problem==='symlink outside'?join(dir,'outside.js'):join(root,'assets/private-test.js'),join(root,'assets/reader-test.js'));
  }
 }});
 assert.equal(f.code,1);assert.ok(!f.port);assert.match(f.stderr,/Public reader requires a valid build manifest/);assert.ok(!f.stderr.includes('fixture-private'));
});

// The offline runner invokes this suite after building the actual artifact.
test('actual Vite reader loads its exact dependencies while lazy editorial chunks stay private',async t=>{
 const buildRoot=new URL('../dist/',import.meta.url);
 const f=await fixture(t,{value:'true',buildRoot});assert.ok(f.port);
 const data=JSON.parse(await readFile(new URL('.vite/manifest.json',buildRoot),'utf8'));
 const publicAssets=readerAssetPaths(data);
 const page=await f.request('/');assert.equal(page.status,200);
 const referenced=[...page.body.matchAll(/(?:src|href)="(\/[^"#]+)"/g)].map(m=>m[1]);
 assert.ok(referenced.length>=3);
 for(const path of referenced)assert.ok(publicAssets.has(path),path+' must be a public reader dependency');
 for(const path of ['/',...publicAssets]){
  const r=await f.request(path);assert.equal(r.status,200,path);
  assert.ok(!/sb_secret_|sk-or-v1-|SUPABASE_SECRET_KEY|OPENROUTER_API_KEY|AQAI_STAGING_PASSWORD|fixture-private/.test(r.body),'public build has no secret markers');
 }
 const admin=data['src/pages/IndexPreview.tsx'];assert.ok(admin?.isDynamicEntry,'admin remains a separate dynamic chunk');
 for(const path of [admin.file,...admin.css]){
  assert.ok(!publicAssets.has('/'+path));privateResponse(await f.request('/'+path));
  assert.equal((await f.request('/'+path,{authorization:auth})).status,200);
 }
 const policy=await createPublicReaderPolicy({root:f.root,value:'true'});
 assert.equal(policy('GET','/index.html'),null);assert.equal(policy('POST','/'),null);
});
