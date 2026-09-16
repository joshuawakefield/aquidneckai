import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const env=fileURLToPath(new URL('../.env.server.local',import.meta.url));
if(fs.existsSync(env))process.loadEnvFile(env);
export const projectURL='https://doxloyksbspclahakkxs.supabase.co';
export async function allRows(path){
 const rows=[];
 for(let offset=0;;offset+=1000){
  const page=await database(path+(path.includes('?')?'&':'?')+'limit=1000&offset='+offset);
  rows.push(...page);if(page.length<1000)return rows;
 }
}
export async function database(path,{method='GET',body}={}){
 const key=process.env.SUPABASE_SECRET_KEY;
 if(process.env.SUPABASE_URL!==projectURL)throw Error('Supabase project URL missing or unexpected');
 if(!key?.startsWith('sb_secret_'))throw Error('Supabase secret key not configured');
 if(!/^(aq_[a-z_]+|rpc\/aq_[a-z_]+)(\?|$)/.test(path))throw Error('Unexpected database resource');
 const response=await fetch(`${projectURL}/rest/v1/${path}`,{
  method,headers:{apikey:key,'Content-Type':'application/json'},
  body:body===undefined?undefined:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(20000)
 });
 if(!response.ok)throw Error(`Database request failed: HTTP ${response.status}`);
 const text=await response.text();
 return text?JSON.parse(text):null;
}
