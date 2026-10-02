import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
// Collection, classification, and the separately gated publisher share one serial cycle.
for(const script of ['collect-feeds.mjs','classify-new.mjs','publish-qualified.mjs']){
 const code=await new Promise(resolve=>{
  const child=spawn(process.execPath,[fileURLToPath(new URL(script,import.meta.url))],{stdio:'inherit',windowsHide:true});
  child.on('error',()=>resolve(1));child.on('close',resolve);
 });
 if(code!==0){process.exitCode=1;break;}
}
