// Offline cloud/local verification. Never run a collector, worker, migration or operator repair.
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import net from 'node:net';
import {syncBuiltinESMExports} from 'node:module';

export const repositoryRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const nodeTests=[
 'test-assessment-batches.mjs','test-assessment-result.mjs','test-bounded-reads.mjs',
 'test-calendar-signals.mjs','test-classification-policy.mjs','test-cloud-environment.mjs','test-collector-policy.mjs',
 'test-cycle-runner.mjs','test-editorial-handler.mjs','test-published-feed.mjs',
 'test-recovery-cache.mjs','test-source-expansion.mjs','test-source-readiness.mjs',
].map(name=>'scripts/'+name);
export const pythonTests=[
 'scripts/test_audit_sources.py','scripts/test_conditional_download.py',
 'scripts/test-source-pages.py','scripts/test-syndicated-feeds.py',
];
export const frontendTests=[
 'src/test/example.test.ts','src/App.test.tsx','src/pages/IndexPreview.test.tsx',
 'src/pages/ReaderHome.test.tsx','src/pages/ReviewQueue.test.tsx',
 'src/components/EditorialReview.test.tsx','src/components/EvidenceText.test.tsx',
 'src/components/LeadCaptureForm.test.tsx','src/lib/date-format.test.ts','src/lib/event-time.test.ts',
];

// Inherited NODE_OPTIONS loads this guard in test subprocesses, including the
// loopback production smoke. It prevents accidental external fetch/TCP access;
// CI should also disable network after dependency installation.
if(process.env.AQAI_CLOUD_OFFLINE_TEST==='1'){
 const loopback=host=>['localhost','127.0.0.1','::1','[::1]'].includes(String(host).toLowerCase());
 const originalFetch=globalThis.fetch;
 globalThis.fetch=(input,...args)=>{
  const url=new URL(typeof input==='string'||input instanceof URL?input:input.url);
  if(!loopback(url.hostname))throw Error('Cloud checks block external network requests.');
  return originalFetch(input,...args);
 };
 const originalConnect=net.Socket.prototype.connect;
 net.Socket.prototype.connect=function(...args){
  const first=Array.isArray(args[0])?args[0][0]:args[0];
  const options=typeof first==='object'&&first!==null?first:null;
  const host=options?.host??(typeof args[1]==='string'?args[1]:'localhost');
  if(!options?.path&&!loopback(host))throw Error('Cloud checks block external TCP connections.');
  return originalConnect.apply(this,args);
 };
 syncBuiltinESMExports();
}

export function cleanEnvironment({offline=true}={}){
 const allowed=new Set(['PATH','HOME','USERPROFILE','TMP','TEMP','TMPDIR','SYSTEMROOT','WINDIR',
  'COMSPEC','PATHEXT','APPDATA','LOCALAPPDATA','PROGRAMFILES','PROGRAMFILES(X86)','PROGRAMW6432',
  'SYSTEMDRIVE','HOMEDRIVE','HOMEPATH','LANG','LC_ALL','LC_CTYPE']);
 // Only the explicit npm installation command opts out of offline mode. Keep
 // its proxy and certificate transport configuration, never package/service keys.
 if(offline===false)for(const name of ['HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','NO_PROXY',
  'NODE_EXTRA_CA_CERTS','SSL_CERT_FILE','SSL_CERT_DIR'])allowed.add(name);
 const env=Object.fromEntries(Object.entries(process.env).filter(([key])=>allowed.has(key.toUpperCase())));
 Object.assign(env,{CI:'1',AQAI_WORKER_ENABLED:'false',AQAI_HEALTH_DB_CHECK:'false',
  PYTHONDONTWRITEBYTECODE:'1',PYTHONIOENCODING:'utf-8'});
 if(offline)Object.assign(env,{AQAI_CLOUD_OFFLINE_TEST:'1',NODE_OPTIONS:'--import='+import.meta.url});
 return env;
}

export function preflight(root=repositoryRoot){
 if(Number(process.versions.node.split('.')[0])!==22)throw Error('Use Node.js 22 for the checked project toolchain.');
 for(const name of fs.readdirSync(root)){
  if(/^\.env(?:\.|$)/.test(name)&&name!=='.env.example')throw Error('Cloud checks require a clean checkout without real .env files. Do not copy local credentials.');
 }
 for(const file of ['package.json','package-lock.json','tsconfig.app.json','vitest.config.ts']){
  if(!fs.existsSync(resolve(root,file)))throw Error('Missing project file: '+file);
 }
 const preferred=process.env.AQAI_CLOUD_PYTHON;
 for(const executable of [...(preferred?[preferred]:[]),...(process.platform==='win32'?['python','python3']:['python3','python'])]){
  const probe=spawnSync(executable,['-c','import sys; print(".".join(map(str,sys.version_info[:3]))); sys.exit(0 if sys.version_info >= (3,9) and sys.version_info.major == 3 else 1)'],
   {cwd:root,env:cleanEnvironment(),encoding:'utf8',timeout:10000,windowsHide:true});
  if(probe.status===0)return {python:executable,pythonVersion:probe.stdout.trim()};
 }
 throw Error('Python 3.9+ is required. Set AQAI_CLOUD_PYTHON to its executable path if it is not on PATH.');
}

export function runCommand(label,command,args,{root=repositoryRoot,offline=true,timeout=120000}={}){
 console.log('\n'+label);
 const result=spawnSync(command,args,{cwd:root,env:cleanEnvironment({offline}),stdio:'inherit',timeout,windowsHide:true});
 if(result.error)throw Error(label+' could not finish: '+result.error.message);
 if(result.status!==0)throw Error(label+' failed (exit '+(result.status??result.signal)+').');
}

export async function runCloudChecks({root=repositoryRoot}={}){
 const runtime=preflight(root);
 const required=[...nodeTests,...pythonTests,...frontendTests,'src/test/setup.ts','scripts/test-production-server.mjs',
  'scripts/reconcile-saved-candidates.mjs','node_modules/typescript/bin/tsc','node_modules/vitest/vitest.mjs','node_modules/vite/bin/vite.js'];
 for(const file of required)if(!fs.existsSync(resolve(root,file)))throw Error('Missing offline test dependency: '+file+'. Run cloud-setup with --install after checking out the complete test files.');
 console.log('Offline checks: Node '+process.versions.node+', Python '+runtime.pythonVersion+'. No service credentials or live worker.');
 runCommand('TypeScript',process.execPath,['node_modules/typescript/bin/tsc','--noEmit','-p','tsconfig.app.json'],{root});
 runCommand('Frontend regression tests',process.execPath,['node_modules/vitest/vitest.mjs','run',...frontendTests],{root});
 runCommand('Backend regression tests',process.execPath,['--test',...nodeTests],{root});
 // Block Python sockets before running the reviewed unittest files. Their HTTP
 // behavior is fully mocked; no source site is contacted for parser verification.
 const pythonHarness='import runpy,socket,sys; socket.socket.connect=lambda *a,**k: (_ for _ in ()).throw(RuntimeError("Cloud checks block network access")); script=sys.argv[1]; sys.path.insert(0,"scripts"); sys.argv=[script]; runpy.run_path(script,run_name="__main__")';
 for(const file of pythonTests)runCommand('Python '+file,runtime.python,['-c',pythonHarness,file],{root});
 runCommand('Production frontend build',process.execPath,['node_modules/vite/bin/vite.js','build'],{root});
 runCommand('Loopback server authentication smoke',process.execPath,['scripts/test-production-server.mjs'],{root});
 console.log('\nCloud checks passed. No live database, source collection, inference, migration or deployment was run.');
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.slice(2).length){console.error('Usage: node scripts/cloud-check.mjs');process.exitCode=1;}
 else try{await runCloudChecks();}catch(error){console.error(error.message);process.exitCode=1;}
}
