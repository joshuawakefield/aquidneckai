import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter,once} from 'node:events';
import {spawn} from 'node:child_process';
import {runStages,terminateStage} from './cycle-runner.mjs';

function stage(exitCode){
 const child=new EventEmitter();child.pid=123;child.kill=()=>true;
 if(exitCode!==undefined)queueMicrotask(()=>child.emit('close',exitCode));
 return child;
}

test('isolated source failure still assesses and publishes available evidence',async()=>{
 const started=[],signals=new EventEmitter();
 assert.equal(await runStages(name=>{started.push(name);return stage(started.length===1?2:0);},{signals,warn:()=>{}}),0);
 assert.deepEqual(started,['collect-feeds.mjs','classify-new.mjs','reconcile-published-events.mjs','publish-qualified.mjs']);
 assert.equal(signals.listenerCount('SIGTERM'),0);
});

test('a failed event reconciliation stops publication until the next safe cycle',async()=>{
 const started=[];
 const code=await runStages(name=>{started.push(name);return stage(name==='reconcile-published-events.mjs'?1:0);},{signals:new EventEmitter()});
 assert.equal(code,1);assert.ok(!started.includes('publish-qualified.mjs'));
});

test('fatal stage failure prevents later paid work',async()=>{
 const started=[];
 assert.equal(await runStages(name=>{started.push(name);return stage(1);},{signals:new EventEmitter()}),1);
 assert.deepEqual(started,['collect-feeds.mjs']);
});

test('shutdown waits for active stage, forwards signal and prevents all later stages',async()=>{
 const signals=new EventEmitter(),started=[],sent=[];let current,settled=false;
 const run=runStages(name=>{started.push(name);return current=stage();},{signals,stopStage:(_,signal)=>sent.push(signal)}).then(code=>{settled=true;return code;});
 signals.emit('SIGTERM');signals.emit('SIGTERM');
 await Promise.resolve();assert.equal(settled,false);
 assert.deepEqual(sent,['SIGTERM']);
 current.emit('close',null);
 assert.equal(await run,143);
 assert.deepEqual(started,['collect-feeds.mjs']);
 assert.deepEqual(sent,['SIGTERM','SIGKILL']);
 assert.equal(signals.listenerCount('SIGINT'),0);
});

test('a stage that ignores shutdown receives forced termination',async()=>{
 const signals=new EventEmitter(),sent=[];let current;
 const run=runStages(()=>current=stage(),{signals,forceAfterMs:5,stopStage:(_,signal)=>{
  sent.push(signal);if(signal==='SIGKILL')queueMicrotask(()=>current.emit('close',null));
 }});
 signals.emit('SIGINT');
 assert.equal(await run,130);
 assert.deepEqual(sent,['SIGINT','SIGKILL','SIGKILL']);
});

test('spawn failure ends the cycle and cleans signal handlers',async()=>{
 const signals=new EventEmitter();
 assert.equal(await runStages(()=>{throw Error('spawn failed');},{signals}),1);
 assert.equal(signals.listenerCount('SIGTERM'),0);
});

test('POSIX shutdown reaches the stage process group, including fetch descendants',()=>{
 const sent=[];
 terminateStage({pid:4321},'SIGTERM',{platform:'linux',kill:(pid,signal)=>sent.push({pid,signal})});
 assert.deepEqual(sent,[{pid:-4321,signal:'SIGTERM'}]);
 assert.equal(terminateStage({pid:4321},'SIGKILL',{platform:'linux',kill:()=>{throw Object.assign(Error(),{code:'ESRCH'});}}),false);
});

test('Windows shutdown uses the spawned child handle without a negative PID',()=>{
 const sent=[];
 terminateStage({pid:4321,kill:signal=>sent.push(signal)},'SIGTERM',{platform:'win32',kill:()=>assert.fail('Unexpected group kill')});
 assert.deepEqual(sent,['SIGTERM']);
});

test('a real active subprocess exits before the interrupted cycle resolves',{timeout:10000},async()=>{
 const signals=new EventEmitter(),started=[];let child;
 const run=runStages(name=>{
  started.push(name);
  return child=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],
   {stdio:'ignore',windowsHide:true,detached:process.platform!=='win32'});
 },{signals});
 try{
  await once(child,'spawn');signals.emit('SIGTERM');
  assert.equal(await run,143);
  assert.deepEqual(started,['collect-feeds.mjs']);
  assert.ok(child.exitCode!==null||child.signalCode!==null);
 }finally{if(child.exitCode===null&&child.signalCode===null)terminateStage(child,'SIGKILL');}
});
