import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {createEditorialHandler} from './editorial-handler.mjs';
const id='11111111-1111-4111-8111-111111111111';
function response(){return {status:null,body:null,writeHead(status){this.status=status;},end(text){this.body=text?JSON.parse(text):null;}};}
function request(body,options={}){
 const req=Readable.from([typeof body==='string'?body:JSON.stringify(body)]);
 Object.assign(req,{method:'POST',url:'/api/aqai/editorial',headers:{host:'staging.aquidneckai.com',origin:'https://staging.aquidneckai.com','content-type':'application/json'},...options});return req;
}
test('same-origin JSON is required before any editorial database write',async()=>{
 let calls=0;const handler=createEditorialHandler(async()=>{calls++;return {};});
 for(const [headers,status] of [
  [{host:'staging.aquidneckai.com','content-type':'application/json'},403],
  [{host:'staging.aquidneckai.com',origin:'https://attacker.example','content-type':'application/json'},403],
  [{host:'staging.aquidneckai.com',origin:'https://staging.aquidneckai.com','content-type':'text/plain'},415],
  [{host:'staging.aquidneckai.com',origin:'https://staging.aquidneckai.com','content-type':'application/json','sec-fetch-site':'cross-site'},403]
 ]){const res=response();await handler(request({id,expectedVersion:0,action:'reject'},{headers}),res);assert.equal(res.status,status);}
 assert.equal(calls,0);
});
test('malformed, oversized and unversioned requests never reach the database',async()=>{
 let calls=0;const handler=createEditorialHandler(async()=>{calls++;return {};});
 for(const [body,status] of [['{',400],['x'.repeat(16001),413],[{id,action:'reject'},400],[{id,expectedVersion:-1,action:'approve'},400],[{id,expectedVersion:0,action:'delete'},400],[{id,expectedVersion:0,action:'note',note:123},400]]){
  const res=response();await handler(request(body),res);assert.equal(res.status,status);
 }assert.equal(calls,0);
});
test('a successful action returns durable state, and stale-version errors preserve 409',async()=>{
 const calls=[];const handler=createEditorialHandler(async(path,options)=>{calls.push({path,options});return options.body.p_review.expectedVersion===0?{ok:true,state:{version:1,history:[{action:'reject'}]}}:{ok:false,status:409,error:'Refresh',version:2};});
 let res=response();await handler(request({id,expectedVersion:0,action:'reject',note:'Not useful'}),res);
 assert.equal(res.status,200);assert.equal(res.body.state.version,1);assert.equal(calls[0].path,'rpc/aq_save_editorial_review');
 res=response();await handler(request({id,expectedVersion:1,action:'approve',note:'Verified current source'}),res);assert.equal(res.status,409);
});
test('bounded state GET validates identity and reports absent observations',async()=>{
 const calls=[];const handler=createEditorialHandler(async(path,options)=>{calls.push({path,options});return null;});
 let res=response();await handler({method:'GET',url:'/api/aqai/editorial?id=bad'},res);assert.equal(res.status,400);assert.equal(calls.length,0);
 res=response();await handler({method:'GET',url:'/api/aqai/editorial?id='+id},res);assert.equal(res.status,404);assert.equal(calls[0].options.body.p_id,id);
});
test('split UTF-8 input preserves editorial notes',async()=>{
 const bytes=Buffer.from(JSON.stringify({id,expectedVersion:0,action:'note',note:'Rhode Island’s AI'}));
 const split=bytes.indexOf(Buffer.from('’'))+1;
 const req=request({});req[Symbol.asyncIterator]=async function*(){yield bytes.subarray(0,split);yield bytes.subarray(split);};
 const handler=createEditorialHandler(async(_,options)=>({ok:true,state:{note:options.body.p_review.note}}));
 const res=response();await handler(req,res);assert.equal(res.body.state.note,'Rhode Island’s AI');
});
