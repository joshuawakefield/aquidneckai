// Coalesce simultaneous reads; bound both successful refreshes and retries after failure.
export function cachedRead(load,{ttlMs=60000,errorTtlMs=10000,now=Date.now}={}){
 let value,error,expires=0,pending;
 return async()=>{
  if(pending)return pending;
  if(now()<expires){if(error)throw error;return value;}
  pending=Promise.resolve().then(load).then(result=>{
   value=result;error=null;expires=now()+ttlMs;return value;
  },failure=>{error=failure;expires=now()+errorTtlMs;throw failure;}).finally(()=>{pending=null;});
  return pending;
 };
}
