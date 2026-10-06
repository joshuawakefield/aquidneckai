import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assessResponse} from './assessment-result.mjs';
import {assessmentText} from './assessment-text.mjs';
const input={id:'a',text:'Newport ChatGPT workshop',sourceKind:'news'};
const o={source_id:'test',url:'https://example.org',source_published_at:'2026-09-19'};
const response=items=>({choices:[{message:{content:JSON.stringify({items})}}]});
const good={id:'a',decision:'candidate',ai_quote:'ChatGPT workshop',local_basis:'Newport',reason:'Explicit AI event'};
test('a missing sibling decision does not discard a valid result',()=>assert.equal(assessResponse(input,o,response([good])).result.decision,'candidate'));
test('missing, duplicate and malformed decisions enter review without retry',()=>{
 for(const r of [response([]),response([good,good]),{choices:[]}])assert.equal(assessResponse(input,o,r).result.decision,'needs_review');
});
test('speculative technology relevance stays withheld',()=>assert.equal(assessResponse(input,o,response([{...good,ai_quote:'technology expansion'}])).result.decision,'needs_review'));
test('image markup cannot consume the evidence window',()=>assert.match(assessmentText({title:'News',evidence_excerpt:'<img data-test="'+'x'.repeat(7000)+'"><p>Newport AI workshop</p>'}),/Newport AI workshop/));
test('ordinary news stays excluded, regional and global AI can be unpublished candidates',()=>{
 assert.equal(assessResponse({...input,text:'Restaurant renovations'},o,response([{...good,ai_quote:'Restaurant renovations'}])).result.decision,'reject');
 for(const place of ['Providence','Boston','worldwide']){
  const assessed=assessResponse({...input,text:'ChatGPT workshop in '+place,municipality:place},o,response([{...good,local_basis:place+'; no specific Island effect is established.'}]));
  assert.equal(assessed.result.decision,'candidate');assert.equal(assessed.result.publication_status,'unpublished');
 }
});
test('missing assessment on ordinary news still requires review',()=>assert.equal(assessResponse({...input,text:'Restaurant renovations'},o,response([])).result.decision,'needs_review'));
