import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
import {JSDOM} from 'jsdom';
const html=readFileSync(new URL('../docs/prototypes/first-release/index.html',import.meta.url),'utf8');
const pure=html.split('// BEGIN CONNECTION STATE:')[1].split('\n').slice(1).join('\n').split('// END CONNECTION STATE')[0];
const context=vm.createContext({Date,Intl}); vm.runInContext(pure,context);
const event={eventDate:'2026-10-15',start:'12:00',end:'13:00',checked:'2026-10-06'};
const state=(data,now)=>context.connectionState(data,new Date(now));
for(const [name,now,expected] of [
 ['upcoming','2026-10-06T23:00:00Z',/^Upcoming/],
 ['before start','2026-10-15T15:59:59Z',/^Advertised for later/],
 ['at start','2026-10-15T16:00:00Z',/^Within advertised/],
 ['before end','2026-10-15T16:59:59Z',/^Within advertised/],
 ['at end','2026-10-15T17:00:00Z',/^Past listing/],
 ['past','2026-10-16T00:00:00Z',/^Past listing/]
]) test(name,()=>assert.match(state(event,now).event,expected));
test('missing, invalid and unknown dates never imply upcoming',()=>{
 for(const eventDate of [undefined,'','2026-02-30','no date']) assert.match(state({...event,eventDate},'2026-10-06T23:00Z').event,/^Next date unknown/);
 assert.match(state(event,'invalid').event,/^Date status unknown/);
});
test('date-only uses Newport day, not viewer timezone or UTC midnight',()=>{
 const data={eventDate:'2026-10-15'};
 assert.match(state(data,'2026-10-15T03:59:59Z').event,/^Future.*exact time unknown/);
 assert.match(state(data,'2026-10-15T04:00:00Z').event,/^Listed for today.*may already have ended/);
 assert.match(state(data,'2026-10-16T03:59:59Z').event,/^Listed for today/);
 assert.match(state(data,'2026-10-16T04:00:00Z').event,/^Past/);
});
test('freshness switches at seven local calendar days; future/missing checks unknown',()=>{
 assert.match(state(event,'2026-10-13T03:59:59Z').freshness,/^Checked within/);
 assert.match(state(event,'2026-10-13T04:00:00Z').freshness,/^Stale/);
 for(const checked of [undefined,'2026-10-07','2026-02-30']) assert.match(state({...event,checked},'2026-10-06T23:00Z').freshness,/unknown/);
});
test('winter date boundary follows EST',()=>{
 assert.match(state({eventDate:'2026-12-01'},'2026-12-02T04:59:59Z').event,/^Listed for today/);
 assert.match(state({eventDate:'2026-12-01'},'2026-12-02T05:00:00Z').event,/^Past/);
});
test('self-contained evidence and repeated search/reset/error states',()=>{
 const dom=new JSDOM(html,{url:'https://prototype.invalid/#connect',runScripts:'dangerously',beforeParse(w){w.scrollTo=()=>{};}});
 try {
 const w=dom.window,d=w.document;
 assert.equal(d.querySelectorAll('.connection').length,2);
 assert.equal(d.querySelectorAll('form,script[src],iframe').length,0);
 for(const a of d.querySelectorAll('.source-link')) {
   assert.equal(new URL(a.href).protocol,'https:');assert.match(a.rel,/noreferrer/);
 }
 for(let n=0;n<3;n++) {
   const input=d.querySelector('#search');input.value='referrals';input.dispatchEvent(new w.Event('input'));
   assert.equal(d.querySelector('#count').textContent,'1 source-backed lead');
   input.value='no-such-lead';input.dispatchEvent(new w.Event('input'));
   assert.equal(d.querySelector('#connection-status').hidden,false);
   d.querySelector('#reset').click();assert.equal(d.querySelector('#count').textContent,'2 source-backed leads');
 }
 for(const mode of ['loading','empty','error']) {
   d.querySelector('#state').value=mode;d.querySelector('#state').dispatchEvent(new w.Event('change'));
   assert.equal(d.querySelectorAll('.connection:not([hidden])').length,0);
   assert.equal(d.querySelector('#connection-status').hidden,false);
 }
 d.querySelector('#reset').click();assert.equal(d.querySelector('#state').value,'available');
 assert.equal(w.localStorage.length,0);assert.equal(w.sessionStorage.length,0);
 assert.match(d.querySelector('#practice-review').textContent,/Friday was never agreed/);
 } finally {dom.window.close();}
});
test('news streams combine search and optional audience filters; reset is reversible',()=>{
 const dom=new JSDOM(html,{url:'https://prototype.invalid/#home',runScripts:'dangerously',beforeParse(w){w.scrollTo=()=>{}}});
 try {
  const w=dom.window,d=w.document;
  const set=(id,value,event='change')=>{const el=d.getElementById(id);el.value=value;el.dispatchEvent(new w.Event(event))};
  const shown=()=>[...d.querySelectorAll('[data-news]:not([hidden])')];
  assert.equal(shown().length,4);
  for(let i=0;i<3;i++){
   set('news-stream','broader');set('news-audience','residents');assert.equal(shown().length,1);assert.match(shown()[0].textContent,/Ethan Mollick/);
   set('news-search',' TOOLs ','input');assert.equal(shown().length,0);assert.equal(d.getElementById('news-status').hidden,false);
   assert.equal(d.querySelectorAll('[data-news-group]:not([hidden])').length,0);
   d.getElementById('news-reset').click();assert.equal(shown().length,4);assert.equal(d.activeElement.id,'news-search');
  }
  set('news-stream','local');set('news-audience','residents');assert.equal(shown().length,1);assert.match(shown()[0].textContent,/fictional/);
 } finally {dom.window.close()}
});
test('news empty/loading/failure are distinct; expiry and source dates stay honest',()=>{
 const dom=new JSDOM(html,{url:'https://prototype.invalid/',runScripts:'dangerously',beforeParse(w){w.scrollTo=()=>{}}});
 try {
  const w=dom.window,d=w.document;
  for(const [mode,pattern] of [['loading',/Loading the selection/],['empty',/No approved items/],['error',/selection is unavailable/]]){
   const el=d.getElementById('news-state');el.value=mode;el.dispatchEvent(new w.Event('change'));
   assert.equal(d.querySelectorAll('[data-news]:not([hidden])').length,0);assert.match(d.getElementById('news-state-title').textContent,pattern);
   assert.equal(d.getElementById('news-reset').hidden,mode==='loading');
  }
  d.getElementById('news-state').value='expired';d.getElementById('news-state').dispatchEvent(new w.Event('change'));
  assert.match(d.querySelector('.news-event-state').textContent,/Past listing.*occurrence unverified/);
  assert.match(d.querySelector('.news-freshness').textContent,/Stale/);
  for(const sample of d.querySelectorAll('.sample-card')){
   assert.match(sample.textContent,/unassigned sample/);assert.match(sample.textContent,/not checked/);assert.equal(sample.querySelectorAll('a[href^="https:"]').length,0);
  }
  const dated=d.querySelector('[data-news="local"] .news-dates');assert.match(dated.textContent,/Source published: unknown/);assert.match(dated.textContent,/October 6, 2026/);
  assert.equal(d.querySelectorAll('form,script[src],iframe').length,0);
  assert.match(html,/connect-src 'none'/);
 } finally {dom.window.close()}
});
