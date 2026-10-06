// Only an explicit calendar-title marker; ordinary prose is not cancellation.
export function explicitCalendarCancellation(title){
 return /^\s*(?:cancelled|canceled|postponed)\b|[\s:()[\]–—-](?:cancelled|canceled|postponed)[\s:()[\]–—.!-]*$/i.test(title??'');
}
