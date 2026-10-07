// Optional local review tooling; no application dependency. Supply installed tool paths.
import {readFileSync,mkdirSync} from 'node:fs';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const html=readFileSync(new URL('../docs/prototypes/first-release/index.html',import.meta.url));
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(html)});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=`http://127.0.0.1:${server.address().port}/`;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const output=process.env.REVIEW_OUTPUT || '/tmp/aq031-review';mkdirSync(output,{recursive:true});
let scans=0;
try {
for(const width of [320,390,1280]) {
 const context=await browser.newContext({viewport:{width,height:900},timezoneId:'Asia/Tokyo'});
 const page=await context.newPage();const errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.clock.install({time:new Date('2026-10-06T23:00:00Z')});
 await page.goto(url);
 await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').textContent(),'Skip to content');
 await page.keyboard.press('Enter');assert.equal(await page.locator(':focus').getAttribute('id'),'main');
 for(const view of ['home','story','guide','connect']) {
   await page.locator(`nav a[href="#${view}"]`).focus();await page.keyboard.press('Enter');
   await page.waitForFunction(v=>document.activeElement?.id===v+'-title',view);
   assert.equal(await page.locator('main > section:visible').count(),1);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(process.env.AXE_PATH){await page.addScriptTag({path:process.env.AXE_PATH});const result=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));assert.deepEqual(result.violations.map(v=>v.id),[]);scans++;}
 }
 for(let i=0;i<3;i++){
   await page.locator('#search').fill(' lunch ');assert.match(await page.locator('#count').textContent(),/^1 /);
   await page.locator('#search').fill('absent');assert.equal(await page.locator('#connection-status').isVisible(),true);
   await page.locator('#reset').focus();await page.keyboard.press('Enter');assert.equal(await page.locator(':focus').getAttribute('id'),'search');
   assert.match(await page.locator('#count').textContent(),/^2 /);
   const summary=page.locator('.connection summary').first();await summary.focus();await page.keyboard.press('Enter');
   assert.equal(await summary.evaluate(e=>e.parentElement.open),true);await page.keyboard.press('Enter');
 }
 await page.locator('#connect .review summary').click();
 await page.locator('#state').selectOption('error');await page.locator('#reset').click();assert.match(await page.locator('#count').textContent(),/^2 /);
 await page.locator('nav a[href="#home"]').click();
 for(let i=0;i<2;i++){
  await page.locator('#news-stream').selectOption('broader');await page.locator('#news-audience').selectOption('residents');
  assert.equal(await page.locator('[data-news]:visible').count(),1);assert.match(await page.locator('[data-news]:visible').textContent(),/Ethan Mollick/);
  await page.locator('#news-search').fill('nonesuch');assert.equal(await page.locator('#news-status').isVisible(),true);
  await page.locator('#news-reset').click();assert.equal(await page.locator('[data-news]:visible').count(),4);
 }
 await page.locator('#home .review summary').click();
 for(const mode of ['loading','empty','error']){await page.locator('#news-state').selectOption(mode);assert.equal(await page.locator('[data-news]:visible').count(),0);assert.equal(await page.locator('#news-status').isVisible(),true)}
 await page.locator('#news-reset').click();
 await page.screenshot({path:`${output}/news-${width}.png`,fullPage:true});
 await page.locator('#news-state').selectOption('expired');assert.match(await page.locator('.news-event-state').textContent(),/Past listing/);
 await page.locator('#news-state').selectOption('available');
 for(const link of await page.locator('[data-news] a[href^="https:"]').all())assert.match(await link.getAttribute('rel'),/noreferrer/);
 await page.locator('nav a[href="#connect"]').click();
 await page.locator('nav a[href="#guide"]').click();await page.goBack();await page.waitForFunction(()=>location.hash==='#connect');
 await page.reload();assert.equal(await page.locator('#connect').isVisible(),true);
 await page.screenshot({path:`${output}/connect-${width}.png`,fullPage:true});
 await page.clock.setFixedTime(new Date('2026-10-15T16:59:59Z'));await page.evaluate(()=>refreshEvidence());
 assert.match(await page.locator('.event-state').first().textContent(),/^Within advertised/);
 await page.clock.setFixedTime(new Date('2026-10-15T17:00:00Z'));await page.clock.runFor(1000);
 assert.match(await page.locator('.event-state').first().textContent(),/^Past listing/);
 assert.match(await page.locator('.freshness').first().textContent(),/^Stale/);
 await page.screenshot({path:`${output}/past-${width}.png`,fullPage:true});
 await page.locator('nav a[href="#guide"]').click();await page.waitForFunction(()=>document.activeElement?.id==='guide-title');await page.locator('#practice-review summary').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#practice-review').getAttribute('open'),'');
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('fixture denial'))},configurable:true})});
 await page.locator('#copy').click();assert.match(await page.locator('#copy-status').textContent(),/prompt is selected/);
 assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
 assert.deepEqual(errors,[]);assert.ok(requests.every(u=>u.startsWith(url)),JSON.stringify(requests));
 await context.close();
}
const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:900}});const page=await context.newPage();await page.goto(url);
assert.equal(await page.locator('main > section:visible').count(),4);assert.match(await page.locator('.event-state').first().textContent(),/not evaluated/);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await context.close();
console.log(`PASS: 320/390/1280px; news combined filters/states/provenance, keyboard, repeated search/reset/disclosure, back/reload, clock transition, no-JS, copy denial, no external requests/storage/errors; ${scans} axe scans. Screenshots: ${output}`);
} finally {await browser.close();await new Promise(r=>server.close(r));}
