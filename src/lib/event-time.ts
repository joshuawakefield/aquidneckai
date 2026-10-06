type EventTimeResult = {iso:string;error?:never}|{iso?:never;error:string};
const LOCAL_TIME=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;
const pad=(value:number)=>String(value).padStart(2,'0');

export function isZonedTimestamp(value:string) {
  const match=/^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.exec(value);
  if(!match||!Number.isFinite(Date.parse(value)))return false;
  const calendarDate=new Date(`${match[1]}-${match[2]}-${match[3]}T12:00:00Z`);
  return Number.isFinite(calendarDate.getTime())&&calendarDate.toISOString().slice(0,10)===value.slice(0,10);
}

export function toLocalEventInput(value:string|null|undefined) {
  if(!value||!isZonedTimestamp(value))return '';
  const date=new Date(value);
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** A local wall clock is not an instant during a daylight-saving gap or overlap. */
export function localEventTimeToISO(value:string):EventTimeResult {
  const match=LOCAL_TIME.exec(value);
  if(!match)return {error:'Choose a complete date and time.'};
  const [year,month,day,hour,minute,second]=match.slice(1).map(Number);
  const parts=[year,month-1,day,hour,minute,second||0];
  const date=new Date(year,month-1,day,hour,minute,second||0);
  date.setFullYear(year);
  const sameWallClock=(candidate:Date)=>[candidate.getFullYear(),candidate.getMonth(),candidate.getDate(),candidate.getHours(),candidate.getMinutes(),candidate.getSeconds()].every((part,index)=>part===parts[index]);
  if(!sameWallClock(date))return {error:'This date or local time does not exist. Check the date and daylight-saving change.'};
  const offset=date.getTimezoneOffset();
  const surroundingOffsets=new Set([new Date(date.getTime()-86400000).getTimezoneOffset(),new Date(date.getTime()+86400000).getTimezoneOffset()]);
  for(const otherOffset of surroundingOffsets) {
    if(otherOffset!==offset&&sameWallClock(new Date(date.getTime()+(otherOffset-offset)*60000)))return {error:'This local time occurs twice during a daylight-saving change. Use exact timestamp mode and specify the source’s UTC offset.'};
  }
  return {iso:date.toISOString()};
}

export function rhodeIslandEventPreview(value:string) {
  if(!isZonedTimestamp(value))return '';
  return new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(new Date(value));
}
