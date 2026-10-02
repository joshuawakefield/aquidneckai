import {cachedRead} from './read-cache.mjs';
export function createHealthSummary(database){
 return cachedRead(()=>database('rpc/aq_health_summary',{method:'POST',body:{}}));
}
export function sourceHealthDegraded(summary,now=Date.now()){
 return summary.sourceFailure||!summary.eligibleSources||
  (summary.oldestNextCheckAt&&now-Date.parse(summary.oldestNextCheckAt)>900000);
}
