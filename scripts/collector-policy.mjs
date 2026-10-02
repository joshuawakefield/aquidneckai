import { createHash } from 'node:crypto';
export function normalizeEntry(entry){
 const url=new URL(entry.url.replaceAll('&amp;','&'));
 if(url.protocol!=='https:'||url.username||url.password)throw Error('Unsupported article URL');
 url.hash='';
 const title=String(entry.title??'').trim().slice(0,2000);
 const description=String(entry.description??'').slice(0,20000);
 const date=Date.parse(entry.sourceDate??'');
 const published_at=Number.isFinite(date)?new Date(date).toISOString():null;
 const content_hash=createHash('sha256').update(JSON.stringify([title,description,published_at])).digest('hex');
 return {url:url.href,title,description,published_at,content_hash};
}
export function normalizeResult(result){
 const cache=result.http_cache;
 const http_cache=cache&&typeof cache==='object'?Object.fromEntries(['endpoint_url','final_url','adapter_version','etag','last_modified']
  .filter(k=>typeof cache[k]==='string'&&cache[k].length<=2048&&!/[\r\n\x00]/.test(cache[k])).map(k=>[k,cache[k]])):undefined;
 if(result.status==='not_modified'){
  if(http_cache?.adapter_version!=='conditional-v1'||!http_cache.endpoint_url||!http_cache.final_url)throw Error('Invalid conditional response');
  return {status:'not_modified',http_cache};
 }
 if(result.status!=='parsed')return {status:'failed',error_type:String(result.error_type??'FetchFailure').slice(0,80)};
 if(!Array.isArray(result.entries)||result.entries.length>500)throw Error('Invalid feed size');
 const unique=new Map();
 for(const entry of result.entries){const e=normalizeEntry(entry);unique.set(e.url+'|'+e.content_hash,e);}
 return {status:'parsed',entries:[...unique.values()],...(http_cache?{http_cache}:{})};
}
