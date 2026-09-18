export function sourceEligible(s){
 const d=s.definition??{};
 return s.runtime_enabled===true&&d.monitor_enabled===true&&
 ((d.monitor_mode==='rss'&&s.verification_status==='feed_parsed')||
 (d.monitor_mode==='calendar'&&s.verification_status==='api_parsed'));
}
