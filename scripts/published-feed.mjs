import {cachedRead} from './read-cache.mjs';
const fields='id,canonical_url,title,summary,local_evidence,towns,kind,status,starts_at,ends_at,published_at';
const publicFields=['id','canonical_url','title','summary','local_evidence','towns','kind','starts_at','ends_at','published_at'];
const dayFormat=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'});
const dateOnly=/^\d{4}-\d{2}-\d{2}$/;
const localDay=now=>{const parts=Object.fromEntries(dayFormat.formatToParts(now).map(p=>[p.type,p.value]));return `${parts.year}-${parts.month}-${parts.day}`;};
function validDateOnly(value){
 if(!dateOnly.test(value??''))return false;
 const parsed=Date.parse(value+'T00:00:00Z');
 return Number.isFinite(parsed)&&new Date(parsed).toISOString().slice(0,10)===value;
}
export function eventState(item,now=Date.now()){
 const value=item.ends_at||item.starts_at;
 if(!value)return 'unknown';
 // A date-only event is valid through its Newport calendar day; never let UTC
 // parsing label it yesterday for a reader in Rhode Island.
 if(validDateOnly(value))return value<localDay(now)?'past':'upcoming';
 if(dateOnly.test(value))return 'unknown';
 const stamp=Date.parse(value);
 return Number.isFinite(stamp)?(stamp<now?'past':'upcoming'):'unknown';
}
const timestamp=value=>Date.parse(value??'')||0;
export function readerPublications(rows,now=Date.now()){
 const safe=rows.filter(item=>item.status==='published');
 const events=safe.filter(item=>item.kind==='event');
 const upcoming=events.filter(item=>eventState(item,now)==='upcoming').sort((a,b)=>timestamp(a.starts_at)-timestamp(b.starts_at)).slice(0,12);
 const news=safe.filter(item=>item.kind!=='event'&&timestamp(item.published_at)<=now&&timestamp(item.published_at)>=now-90*86400000).sort((a,b)=>timestamp(b.published_at)-timestamp(a.published_at)).slice(0,12);
 const pastEvents=events.filter(item=>eventState(item,now)==='past').sort((a,b)=>timestamp(b.ends_at||b.starts_at)-timestamp(a.ends_at||a.starts_at)).slice(0,6);
 // Project again at the public boundary, even if a future DB select widens.
 const publicItem=item=>Object.fromEntries(publicFields.filter(field=>Object.hasOwn(item,field)).map(field=>[field,item[field]]));
 return {items:[...upcoming,...news].map(publicItem),pastEvents:pastEvents.map(publicItem)};
}
export function createPublishedFeed(db,{now=Date.now}={}){
 const read=cachedRead(async()=>{
  const stamp=new Date(now()).toISOString(),recent=new Date(now()-90*86400000).toISOString();
  const rows=await Promise.all([
   db(`aq_entries?status=eq.published&kind=eq.event&or=(starts_at.gte.${stamp},ends_at.gte.${stamp})&select=${fields}&order=starts_at.asc,id.asc&limit=40`),
   db(`aq_entries?status=eq.published&kind=neq.event&published_at=gte.${recent}&published_at=lte.${stamp}&select=${fields}&order=published_at.desc,id.desc&limit=48`),
   db(`aq_entries?status=eq.published&kind=eq.event&starts_at=lt.${stamp}&or=(ends_at.is.null,ends_at.lt.${stamp})&select=${fields}&order=starts_at.desc,id.desc&limit=12`)
  ]);
  return [...new Map(rows.flat().map(item=>[item.id,item])).values()];
 },{now});
 return async()=>readerPublications(await read(),now());
}
