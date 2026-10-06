import test from 'node:test';
import assert from 'node:assert/strict';
import {loadRecoveryResponses} from './recovery-cache.mjs';

const directory=new URL('file:///recovery-test/');
const trial=(id,saved_response)=>({report:{observation_id:id,saved_response}});

function fakeFiles(batches){
 let cursor=0;const read=[],state={closed:false};
 return {read,state,opendirSync:()=>({
  readSync:()=>cursor<batches.length?{name:`${cursor++}.json`,isFile:()=>true}:null,
  closeSync:()=>{state.closed=true;},
 }),readFileSync:url=>{const index=Number(url.pathname.split('/').pop().split('.')[0]);read.push(index);return typeof batches[index]==='string'?batches[index]:JSON.stringify(batches[index]);}};
}

test('database-backed saved responses require no local directory or file reads',()=>{
 const files={opendirSync:()=>assert.fail('Unnecessary local cache scan')};
 assert.equal(loadRecoveryResponses([trial('one',{id:'provider-response'})],{directory,files}).size,0);
 assert.equal(loadRecoveryResponses([],{directory,files}).size,0);
});

test('fallback stops when missing responses are found and retains only needed IDs',()=>{
 const files=fakeFiles([
  {inputs:[{id:'requested',text:'AI workshop'},{id:'unrelated',text:'other'}],response:{id:'saved'}},
  {inputs:[{id:'older'}],response:{id:'should-not-be-read'}},
 ]);
 const cached=loadRecoveryResponses([trial('requested'),trial('database-ready',{id:'db'})],{directory,files});
 assert.deepEqual([...cached.keys()],['requested']);
 assert.equal(cached.get('requested').response.id,'saved');
 assert.equal(cached.get('requested').count,2);
 assert.deepEqual(files.read,[0]);assert.equal(files.state.closed,true);
});

test('corrupt local batches do not hide a later recoverable response',()=>{
 const files=fakeFiles(['{broken',{inputs:[{id:'requested'}],response:{id:'saved'}}]);
 const cached=loadRecoveryResponses([trial('requested')],{directory,files});
 assert.equal(cached.get('requested').response.id,'saved');
 assert.deepEqual(files.read,[0,1]);assert.equal(files.state.closed,true);
});

test('missing local responses stay absent for existing human-review handling',()=>{
 const files=fakeFiles([{inputs:[{id:'unrelated'}],response:{id:'saved'}}]);
 assert.equal(loadRecoveryResponses([trial('missing')],{directory,files}).size,0);
 assert.equal(files.state.closed,true);
 const absent={opendirSync:()=>{throw Object.assign(Error(),{code:'ENOENT'});}};
 assert.equal(loadRecoveryResponses([trial('missing')],{directory,files:absent}).size,0);
});
