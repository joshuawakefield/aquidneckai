import test from 'node:test';
import assert from 'node:assert/strict';
import {collectBatch} from './collection-batch.mjs';
import {sourceEligible} from './source-readiness.mjs';
import {assessmentText} from './assessment-text.mjs';
import {enforceEvidence} from './classification-policy.mjs';
test('source failure is saved without cancelling later successful sources',async()=>{
 const saved=[];const sources=Array.from({length:18},(_,id)=>({id}));let active=0,maximum=0;
 const result=await collectBatch(sources,async s=>{active++;maximum=Math.max(maximum,active);await new Promise(r=>setTimeout(r,1));active--;return {status:s.id===0?'failed':'parsed'};},x=>x,async(s,r)=>{saved.push(s.id);return {status:r.status==='failed'?'failed':'succeeded'};});
 assert.equal(result.failed,1);assert.equal(saved.length,18);assert.ok(maximum<=4);
});
test('a database persistence failure fails collection',async()=>{
 await assert.rejects(collectBatch([{id:1}],async()=>({}),x=>x,async()=>{throw Error('database unavailable');}),/database unavailable/);
});
test('page collection requires verified matching adapter and explicit enablement',()=>{
 const s={runtime_enabled:true,verification_status:'page_parsed',definition:{monitor_enabled:true,monitor_mode:'public_page'}};
 assert.equal(sourceEligible(s),true);assert.equal(sourceEligible({...s,verification_status:'imported_unverified'}),false);
 assert.equal(sourceEligible({...s,runtime_enabled:false}),false);
});
test('long page AI evidence survives within the original assessment budget',()=>{
 const text=assessmentText({title:'State programs',evidence_excerpt:'unrelated words '.repeat(1000)+' Artificial intelligence training for Rhode Island businesses. '+'more text '.repeat(1000)});
 assert.ok(text.includes('Artificial intelligence training for Rhode Island businesses.'));assert.ok(text.length<=6000);
});
test('unambiguous model names qualify as evidence; ordinary names do not',()=>{
 for(const text of ['Introducing GPT-6 for business','Introducing Claude Sonnet 5.5'])assert.equal(enforceEvidence({text},{decision:'candidate',ai_quote:text}).decision,'candidate');
 assert.equal(enforceEvidence({text:'Claude visited Newport'},{decision:'candidate',ai_quote:'Claude visited Newport'}).decision,'needs_review');
});
