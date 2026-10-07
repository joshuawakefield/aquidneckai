// AQ-030: built application, disposable Basic auth, intercepted fixture APIs only.
// Run after cloud-check; AQAI_PLAYWRIGHT_MODULE points to an installed Playwright module.
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {randomBytes,createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {cleanEnvironment} from './cloud-check.mjs';
const {chromium}=await import(process.env.AQAI_PLAYWRIGHT_MODULE);
const output=resolve(process.env.AQAI_SCREENSHOT_DIR);
await mkdir(output,{recursive:true});
const password=randomBytes(24).toString('hex');
const origin='http://127.0.0.1:4187';
const server=spawn(process.execPath,['scripts/production-server.mjs'],{env:{...cleanEnvironment(),PORT:'4187',AQAI_BIND_HOST:'127.0.0.1',AQAI_STAGING_PASSWORD:password},stdio:'ignore'});
let browser;
const captures=[];
try {
 for(let i=0;i<50;i++){try{if((await fetch(origin+'/livez')).ok)break;}catch{} await new Promise(r=>setTimeout(r,100));}
 for(const path of ['/','/admin','/index-preview','/api/aqai/preview'])assert.equal((await fetch(origin+path)).status,401);
 browser=await chromium.launch({executablePath:process.env.AQAI_CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 for(const width of [1280,390]){
  const context=await browser.newContext({viewport:{width,height:900},httpCredentials:{username:'aqai',password},serviceWorkers:'block',reducedMotion:'reduce'});
  const page=await context.newPage(); const errors=[],requests=[];let failed=false;
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',async route=>{
   const req=route.request(),url=new URL(req.url());
   if(url.origin!==origin)return route.abort();
   if(url.pathname.startsWith('/api/')){
    requests.push({path:url.pathname,method:req.method()});assert.equal(req.method(),'GET');
    if(url.pathname==='/api/aqai/published')return route.fulfill({json:{items:[],pastEvents:[]}});
    if(url.pathname==='/api/aqai/preview')return failed?route.fulfill({status:503,json:{error:'Fixture unavailable'}}):route.fulfill({json:{fetchedAt:'2026-10-07T00:00:00Z',inferenceBudget:{checkedAt:null,usedUsd:null,remainingUsd:null},observations:12,classified:10,classificationPending:2,reviewRequired:1,sources:[],items:[]}});
    if(url.pathname==='/api/aqai/review')return route.fulfill({json:{items:[{id:'fixture-review',title:'Fictional workshop assessment — review fixture',url:'https://example.org/fixture',source:'Synthetic source',date:null,decision:'needs_review',reason:'The quoted AI claim could not be verified in the supplied excerpt.',issue:'invalid_evidence',aiEvidence:'',localEvidence:''}],total:1}});
    throw Error('Unexpected API '+url.pathname);
   }
   return route.continue();
  });
  async function capture(name,selector){
   if(selector)await page.locator(selector).scrollIntoViewIfNeeded();
   await page.evaluate(()=>document.fonts.ready);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow');
   const file=`${name}-${width}.png`;await page.screenshot({path:resolve(output,file)});
   captures.push({file,width,height:900,sha256:createHash('sha256').update(await readFile(resolve(output,file))).digest('hex')});
  }
  await page.goto(origin);await page.getByText('No current listings published here yet.').waitFor();
  await capture('reader-home');
  await page.getByRole('searchbox').fill('Newport');await page.getByText('1 matching resources').waitFor();
  await capture('resources','#resources');
  await page.getByRole('searchbox').fill('zzzz');await page.getByText('0 matching resources').waitFor();
  await page.getByRole('button',{name:'Show all resources'}).click();
  const practice=page.locator('#put-it-to-work article').first();
  await practice.locator('summary').focus();await page.keyboard.press('Enter');
  assert(await practice.locator('details').getAttribute('open')!==null);
  assert.match(await practice.innerText(),/Do not invent prices/);
  await capture('follow-up','#put-it-to-work');
  assert.equal(await page.locator('#put-it-to-work input,#put-it-to-work textarea,#put-it-to-work form').count(),0);
  await page.goto(origin+'/admin');await page.getByText('Usage unavailable',{exact:true}).waitFor();
  assert.match(await page.locator('body').innerText(),/unknown, not zero/);
  await capture('dashboard-unknown','section[aria-labelledby="inference-heading"]');
  await page.getByRole('link',{name:'Go to assessment review'}).click();
  await page.locator('#assessment-review summary').click();
  await page.getByRole('combobox',{name:'Assessment filter'}).selectOption('needs_review');
  await page.getByText(/1 matching records/).waitFor();
  await page.getByText('Unresolved · Needs human review',{exact:true}).waitFor();
  await capture('exception-review','#assessment-review article');
  failed=true;await page.reload();await page.getByRole('alert').filter({hasText:'Database refresh failed'}).waitFor();
  await capture('dashboard-unavailable','section[aria-labelledby="inference-heading"]');
  assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
  assert.deepEqual(errors,[]);
  assert(requests.every(r=>r.method==='GET'));
  await context.close();
 }
 await writeFile(resolve(output,'screenshots.json'),JSON.stringify({candidate:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),fixtureOnly:true,externalRequestsBlocked:true,captures},null,2)+'\n');
 console.log(`PASS: ${captures.length} captures; desktop/mobile navigation, search/reset, keyboard disclosure, private auth, unknown budget, review filter, failed reload, no overflow/storage/writes/page errors.`);
} finally {await browser?.close();server.kill('SIGTERM');}
