import fs from 'node:fs';

// Saved database responses are sufficient for normal recovery. Only inspect the
// local fallback for missing responses, retain requested IDs, and stop when found.
export function loadRecoveryResponses(trials,{directory,files=fs}){
 const missing=new Set(trials.filter(t=>!t.report.saved_response).map(t=>t.report.observation_id));
 const cached=new Map();
 if(!missing.size)return cached;
 let entries;
 try{entries=files.opendirSync(directory);}catch(error){if(error.code==='ENOENT')return cached;throw error;}
 try{
  let entry;
  while(missing.size&&(entry=entries.readSync())){
   if(!entry.isFile()||!entry.name.endsWith('.json'))continue;
   try{
    const batch=JSON.parse(files.readFileSync(new URL(entry.name,directory)));
    if(!Array.isArray(batch.inputs))continue;
    for(const input of batch.inputs){
     if(!input||!missing.has(input.id))continue;
     cached.set(input.id,{input,response:batch.response,count:batch.inputs.length});missing.delete(input.id);
    }
   }catch{/* Keep looking for a valid saved batch; never make a paid request. */}
  }
 }finally{entries.closeSync();}
 return cached;
}
