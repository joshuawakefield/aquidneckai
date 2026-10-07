// Proposal only: hosted enablement needs separate release approval.
import {readFile,realpath,stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';

export function publicReaderEnabled(value){
 if(value===undefined||value==='false')return false;
 if(value==='true')return true;
 // Never echo a configuration value: it could contain a misplaced secret.
 throw Error('AQAI_PUBLIC_READER_ENABLED must be absent, false or true');
}

// Inspect the raw request target BEFORE URL parsing can erase dot segments or
// convert backslashes. No encoded path aliases are needed by these routes.
// Queries do not select files/routes; their contents are left to API handlers.
export function canonicalRequestPath(target){
 if(typeof target!=='string'||/[\x00-\x20\x7f#]/.test(target))return null;
 const path=target.split('?',1)[0];
 if(!/^\/[A-Za-z0-9_./-]*$/.test(path)||path.includes('//'))return null;
 if(path.split('/').some(part=>part==='.'||part==='..'))return null;
 return path;
}

export async function safeBuildFile(root,path){
 const base=await realpath(root),file=resolve(base,'.'+path);
 if(!file.startsWith(base+sep))return null;
 try{
  // Disallow symlinks even within dist: an alias must not publish a private file.
  if(await realpath(file)!==file||!(await stat(file)).isFile())return null;
  return file;
 }catch(error){
  if(['ENOENT','ENOTDIR','ELOOP'].includes(error.code))return null;
  throw error;
 }
}

export function readerAssetPaths(manifest){
 const invalid=()=>{throw Error('Invalid public reader build manifest');};
 if(!manifest||typeof manifest!=='object'||Array.isArray(manifest))invalid();
 const entry=manifest['index.html'];
 if(!entry||entry.isEntry!==true)invalid();
 const paths=new Set(['/favicon.svg']),visited=new Set();
 const list=value=>{
  if(value===undefined)return [];
  if(!Array.isArray(value)||value.some(v=>typeof v!=='string'))invalid();
  return value;
 };
 const add=(file,extensions)=>{
  if(typeof file!=='string'||!/^assets\/[A-Za-z0-9_-]+\.(js|css|svg|png|jpg|ico|woff2)$/.test(file))invalid();
  if(!extensions.includes(extname(file)))invalid();
  paths.add('/'+file);
 };
 const visit=key=>{
  if(visited.has(key))return;
  if(!Object.hasOwn(manifest,key))invalid();
  const chunk=manifest[key];
  if(!chunk||typeof chunk!=='object'||Array.isArray(chunk)||chunk.isDynamicEntry)invalid();
  visited.add(key);add(chunk.file,['.js']);
  for(const file of list(chunk.css))add(file,['.css']);
  for(const file of list(chunk.assets))add(file,['.svg','.png','.jpg','.ico','.woff2']);
  for(const dependency of list(chunk.imports))visit(dependency);
  // Dynamic imports (the editorial workspace) never enter the public allowlist.
 };
 visit('index.html');
 return paths;
}

export async function createPublicReaderPolicy({root,value}){
 if(!publicReaderEnabled(value))return ()=>null;
 let assets;
 try{
  assets=readerAssetPaths(JSON.parse(await readFile(resolve(root,'.vite/manifest.json'),'utf8')));
  for(const path of ['/index.html',...assets])if(!await safeBuildFile(root,path))throw Error();
 }catch{
  // An invalid manifest or missing required file must stop opt-in startup.
  throw Error('Public reader requires a valid build manifest and regular reader files');
 }
 return (method,path)=>{
  if(method!=='GET'&&method!=='HEAD')return null;
  if(path==='/')return '/index.html';
  return assets.has(path)?path:null;
 };
}
