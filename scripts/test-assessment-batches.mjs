import test from 'node:test';
import assert from 'node:assert/strict';
import {assessmentBatches,assessmentItemSchema,ASSESSMENT_MAX_OUTPUT_TOKENS} from './assessment-batches.mjs';
import {assessmentExcerpt} from './assessment-text.mjs';
import {reconcileSavedCandidate,OBSOLETE_GEOGRAPHY_REASON} from './reconcile-saved-candidates.mjs';
test('long evidence uses smaller batches; no item is dropped or duplicated',()=>{
 const items=Array.from({length:10},(_,id)=>({id,text:'x'.repeat(6000)}));
 const batches=assessmentBatches(items,x=>x.text);
 assert.deepEqual(batches.map(b=>b.length),[3,3,3,1]);assert.deepEqual(batches.flat(),items);
 assert.deepEqual(assessmentBatches(items.map(i=>({...i,text:'short'})),x=>x.text).map(b=>b.length),[4,4,2]);
 assert.equal(ASSESSMENT_MAX_OUTPUT_TOKENS,2600);assert.equal(assessmentItemSchema.properties.ai_quote.maxLength,240);
});
test('evidence excerpts retain late AI passages without returning an entire article',()=>{
 const excerpt=assessmentExcerpt('Welcome. '+'ordinary content '.repeat(600)+' Newport AI workshop on October 7. '+'closing '.repeat(600));
 assert.match(excerpt,/Newport AI workshop/);assert.ok(excerpt.length<=6000);assert.match(excerpt,/excerpt/);
});
const observation={id:'item',source_id:'regional',url:'https://example.org/ai',source_published_at:'2026-10-01'};
const report={observation_id:'item',status:'completed',input_text:'Providence AI training for small businesses.',model_result:{id:'item',decision:'candidate',ai_quote:'AI training for small businesses',local_basis:'Rhode Island training; no particular Island effect is established.',reason:'Business training'},result:{decision:'needs_review',reason:OBSOLETE_GEOGRAPHY_REASON}};
test('saved broader-coverage decisions are repaired without publishing or inference',()=>{
 const result=reconcileSavedCandidate(report,observation,{definition:{endpoint_type:'news'}},Date.parse('2026-10-05'));
 assert.equal(result.result.decision,'candidate');assert.equal(result.result.publication_status,'unpublished');assert.equal(result.result.destination,'current_review');
 assert.deepEqual(result.coverage_reconciliation.previous_result,report.result);assert.equal(report.result.decision,'needs_review');
});
test('reconciliation refuses malformed, mismatched, non-exact or independently withheld results',()=>{
 for(const changed of [
  {...report,result:{decision:'needs_review',reason:'Other issue'}},
  {...report,input_text:'Unrelated text'},
  {...report,model_result:{...report.model_result,ai_quote:'Invented AI claim'}},
  {...report,model_result:{...report.model_result,id:'wrong'}},
  {...report,model_result:null},
  {...report,input_text:''}
 ])assert.equal(reconcileSavedCandidate(changed,observation,{}),null);
});
