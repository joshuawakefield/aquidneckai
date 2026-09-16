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
 if(result.status!=='parsed')return {status:'failed',error_type:String(result.error_type??'FetchFailure').slice(0,80)};
 if(!Array.isArray(result.entries)||result.entries.length>500)throw Error('Invalid feed size');
 const unique=new Map();
 for(const entry of result.entries){const e=normalizeEntry(entry);unique.set(e.url+'|'+e.content_hash,e);}
 return {status:'parsed',entries:[...unique.values()]};
}
