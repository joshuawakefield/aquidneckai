import test from 'node:test';
import assert from 'node:assert/strict';
import {cachedRead} from './read-cache.mjs';
import {sourceHealthDegraded} from './health-summary.mjs';
import {recoveryWork} from './recover-assessments.mjs';
import {createPreviewHandler} from './preview-handler.mjs';

test('simultaneous polls share a read; TTL refreshes and failures are not hidden by stale success',async()=>{
 let now=0,calls=0,fail=false;
 const read=cachedRead(async()=>{calls++;if(fail)throw Error('offline');return calls;},{now:()=>now,ttlMs:60,errorTtlMs:10});
 assert.deepEqual(await Promise.all([read(),read(),read()]),[1,1,1]);assert.equal(calls,1);
 now=59;assert.equal(await read(),1);now=60;assert.equal(await read(),2);
 fail=true;now=120;await assert.rejects(read(),/offline/);await assert.rejects(read(),/offline/);assert.equal(calls,3);
 now=130;fail=false;assert.equal(await read(),4);
});
test('health summary still notices overdue work as cached timestamps age',()=>{
 const summary={eligibleSources:19,sourceFailure:false,oldestNextCheckAt:new Date(0).toISOString()};
 assert.equal(Boolean(sourceHealthDegraded(summary,900000)),false);
 assert.equal(Boolean(sourceHealthDegraded(summary,900001)),true);
 assert.equal(Boolean(sourceHealthDegraded({...summary,sourceFailure:true},0)),true);
});
test('idle recovery never downloads observations or completed reports',async()=>{
 const paths=[];const result=await recoveryWork(async path=>{paths.push(path);return [];},1000000);
 assert.deepEqual(result,{trials:[],observations:[]});assert.equal(paths.length,1);
 assert.match(paths[0],/status=neq.completed/);assert.match(paths[0],/limit=80/);
});
test('recovery loads only the claimed observation IDs',async()=>{
 const id='11111111-1111-4111-8111-111111111111',paths=[];
 await recoveryWork(async path=>{paths.push(path);return paths.length===1?[{report:{observation_id:id}}]:[{id}];});
 assert.equal(paths.length,2);assert.ok(paths[1].includes('id=in.('+id+')'));
 assert.ok(!paths[1].includes('select=*'));
});
function response(){return {status:null,body:null,headers:null,writeHead(status,headers){this.status=status;this.headers=headers;},end(body){this.body=body?JSON.parse(body):null;}};}
test('overview polls share one summary and never retrieve the review history',async()=>{
 const paths=[],handler=createPreviewHandler(async path=>{paths.push(path);return {observations:100000,sources:[],items:[]};});
 const a=response(),b=response();await Promise.all([handler({method:'GET',url:'/api/aqai/preview'},a),handler({method:'GET',url:'/api/aqai/preview'},b)]);
 assert.deepEqual(paths,['rpc/aq_preview_summary']);assert.equal(a.status,200);assert.equal(b.body.observations,100000);
});
test('review is bounded, invalid parameters cause no query, and evidence is fetched for one item',async()=>{
 const calls=[],handler=createPreviewHandler(async(path,options)=>{calls.push({path,options});return path.startsWith('aq_observations')?[{evidence_excerpt:'<p>Only this item</p>'}]:{items:[],total:0};});
 let res=response();await handler({method:'GET',url:'/api/aqai/review?offset=-1'},res);assert.equal(res.status,400);assert.equal(calls.length,0);
 res=response();await handler({method:'GET',url:'/api/aqai/review?decision=reject&q=needle&offset=25'},res);
 assert.deepEqual(calls[0].options.body,{p_decision:'reject',p_query:'needle',p_offset:25,p_limit:25});
 res=response();await handler({method:'GET',url:'/api/aqai/evidence?id=invalid'},res);assert.equal(res.status,400);assert.equal(calls.length,1);
 res=response();await handler({method:'GET',url:'/api/aqai/evidence?id=11111111-1111-4111-8111-111111111111'},res);
 assert.equal(res.body.excerpt,'Only this item');assert.match(calls[1].path,/limit=1$/);
});
