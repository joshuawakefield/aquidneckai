import test from 'node:test';
import assert from 'node:assert/strict';
import {createPublishedFeed,eventState,readerPublications} from './published-feed.mjs';
const now=Date.parse('2026-10-05T02:00:00Z'); // October 4, 10pm Newport.
const event=(id,date,extra={})=>({id,kind:'event',status:'published',starts_at:date,published_at:'2026-09-16T00:00:00Z',...extra});
test('published past events never occupy the upcoming list and withdrawn events stay private',()=>{
 const data=readerPublications([event('past','2026-09-22T14:00:00Z'),event('future','2026-10-07T14:00:00Z'),event('withdrawn','2026-10-08T14:00:00Z',{status:'withdrawn'}),event('unknown',null)],now);
 assert.deepEqual(data.items.map(i=>i.id),['future']);assert.deepEqual(data.pastEvents.map(i=>i.id),['past']);
 assert.equal('status' in data.items[0],false);
});
test('event end time and Newport date-only boundaries determine whether an event has passed',()=>{
 assert.equal(eventState(event('ongoing','2026-10-05T01:00:00Z',{ends_at:'2026-10-05T03:00:00Z'}),now),'upcoming');
 assert.equal(eventState(event('today','2026-10-04'),now),'upcoming');
 assert.equal(eventState(event('yesterday','2026-10-03'),now),'past');
 assert.equal(eventState(event('invalid','2026-02-31'),now),'unknown');
});
test('public projection drops unexpected private fields from current and archived entries',()=>{
 const extra={review_notes:'fixture-private',evidence_excerpt:'fixture-private',claim:'fixture-private',provider_usage:{key:'fixture-private'}};
 const data=readerPublications([event('future','2026-10-07',extra),event('past','2026-09-01',extra),event('draft','2026-10-08',{...extra,status:'candidate'})],now);
 for(const item of [...data.items,...data.pastEvents]){
  assert.deepEqual(Object.keys(item).sort(),['id','kind','starts_at','published_at'].sort());
 }
 assert.ok(!JSON.stringify(data).includes('fixture-private'));
});
test('homepage arrays are bounded, recent articles are ordered and archives are explicit',()=>{
 const events=Array.from({length:30},(_,i)=>event('past'+i,new Date(now-(i+1)*86400000).toISOString()));
 const future=Array.from({length:30},(_,i)=>event('future'+i,new Date(now+(i+1)*86400000).toISOString()));
 const news=Array.from({length:30},(_,i)=>({id:'news'+i,kind:'news',status:'published',published_at:new Date(now-i*86400000).toISOString()}));
 const data=readerPublications([...events,...future,...news,{id:'ancient',kind:'news',status:'published',published_at:'2023-01-01'}],now);
 assert.equal(data.items.length,24);assert.equal(data.pastEvents.length,6);assert.equal(data.pastEvents[0].id,'past0');assert.equal(data.items[12].id,'news0');assert.ok(!data.items.some(i=>i.id==='ancient'));
});
test('reads have a combined 100-row ceiling, share cache and reclassify expiring events without refetching',async()=>{
 let clock=now;const calls=[];
 const feed=createPublishedFeed(async path=>{calls.push(path);return path.includes('limit=40')?[event('crossing',new Date(now+1000).toISOString())]:[];},{now:()=>clock});
 const [a,b]=await Promise.all([feed(),feed()]);assert.equal(calls.length,3);assert.equal(a.items.length,1);assert.deepEqual(a,b);
 assert.equal(calls.reduce((n,p)=>n+Number(p.match(/limit=(\d+)$/)[1]),0),100);
 assert.ok(calls.every(p=>p.includes('status=eq.published')&&!p.includes('select=*')));
 clock+=2000;const expired=await feed();assert.equal(calls.length,3);assert.equal(expired.items.length,0);assert.equal(expired.pastEvents.length,1);
});
