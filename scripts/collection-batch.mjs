// Per-source failures do not prevent independent sources or later classification.
// A database failure remains fatal: stop starting work and let outstanding leases expire.
export async function collectBatch(sources,fetchSource,normalizeResult,save){
 let cursor=0,failed=0,fatal;
 async function worker(){
  while(!fatal&&cursor<sources.length){
   const source=sources[cursor++];let result;
   try{result=normalizeResult(await fetchSource(source));}catch{result={status:'failed',error_type:'ValidationFailed'};}
   try{const saved=await save(source,result);if(saved.status==='failed')failed++;}
   catch(error){fatal=error;}
  }
 }
 await Promise.all(Array.from({length:Math.min(4,sources.length)},worker));
 if(fatal)throw fatal;
 return {checked:sources.length,failed};
}
