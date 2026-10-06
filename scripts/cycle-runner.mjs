// A hosted cycle must stop its current stage before starting another one.
export function terminateStage(child,signal,runtime=process){
 if(runtime.platform!=='win32'&&child.pid){
  try{return runtime.kill(-child.pid,signal);}catch(error){if(error.code==='ESRCH')return false;throw error;}
 }
 return child.kill(signal);
}

export async function runStages(spawnStage,{signals=process,stopStage=terminateStage,forceAfterMs=5000,warn=console.warn}={}){
 let stopping=false,stopSignal,active=null,forceTimer;
 const signalStage=signal=>{if(active)try{stopStage(active,signal);}catch{warn('Unable to signal the active cycle stage.');}};
 const stop=signal=>{
  if(stopping)return;
  stopping=true;stopSignal=signal;
  signalStage(signal);
  if(active)forceTimer=setTimeout(()=>signalStage('SIGKILL'),forceAfterMs);
 };
 const onInterrupt=()=>stop('SIGINT');
 const onTerminate=()=>stop('SIGTERM');
 signals.on('SIGINT',onInterrupt);signals.on('SIGTERM',onTerminate);
 try{
  for(const script of ['collect-feeds.mjs','classify-new.mjs','reconcile-published-events.mjs','publish-qualified.mjs']){
   if(stopping)break;
   const code=await new Promise(resolve=>{
    let settled=false;
    const finish=code=>{
     if(settled)return;settled=true;
     // On POSIX the stage has its own process group. Clear any descendant
     // that survived its parent's graceful exit (including Python fetchers).
     if(stopping)signalStage('SIGKILL');
     clearTimeout(forceTimer);active=null;resolve(code);
    };
    try{active=spawnStage(script);}catch{finish(1);return;}
    active.once('error',()=>finish(1));active.once('close',finish);
   });
   if(stopping)break;
   if(script==='collect-feeds.mjs'&&code===2){warn('Some sources failed; their status is recorded. Continuing assessment of available evidence.');continue;}
   if(code!==0)return 1;
  }
  return stopping?(stopSignal==='SIGINT'?130:143):0;
 }finally{
  clearTimeout(forceTimer);
  signals.off('SIGINT',onInterrupt);signals.off('SIGTERM',onTerminate);
 }
}
