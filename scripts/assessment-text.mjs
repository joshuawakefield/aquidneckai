export const AI_TERM=/\b(?:AI|artificial intelligence|machine learning|deep learning|ChatGPT|generative AI|large language models?|LLMs?|neural networks?)\b/i;
export function plainText(value){
 return String(value??'').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]*>/g,' ')
 .replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>{const c=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);return c>0&&c<=0x10ffff?String.fromCodePoint(c):' ';})
 .replace(/&(amp|quot|apos|nbsp|lt|gt);/gi,(_,n)=>({amp:'&',quot:'"',apos:"'",nbsp:' ',lt:'<',gt:'>'}[n.toLowerCase()])).replace(/\s+/g,' ').trim();
}
export function assessmentText(o){
 const text=plainText(o.title+'\n'+(o.evidence_excerpt??''));
 if(text.length<=6000)return text;
 const spans=[[0,1200]];
 for(const match of text.matchAll(new RegExp(AI_TERM.source,'gi'))){
  const start=Math.max(0,match.index-300),end=Math.min(text.length,match.index+900);
  const previous=spans.at(-1);
  if(start<=previous[1])previous[1]=Math.max(previous[1],end);else spans.push([start,end]);
 }
 return spans.map(([a,b])=>text.slice(a,b)).join(' [... excerpt ...] ').slice(0,6000);
}
