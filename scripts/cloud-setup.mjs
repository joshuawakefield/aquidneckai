// Package installation is explicit; all verification after it runs offline.
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {dirname,join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {cleanEnvironment,preflight,repositoryRoot,runCloudChecks,runCommand} from './cloud-check.mjs';

function npmCLI(){
 const candidates=[join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js'),
  resolve(dirname(process.execPath),'../lib/node_modules/npm/bin/npm-cli.js')];
 const lookup=spawnSync(process.platform==='win32'?'where.exe':'which',['npm'],{env:cleanEnvironment(),encoding:'utf8',timeout:10000,windowsHide:true});
 if(lookup.status===0)for(const name of lookup.stdout.trim().split(/\r?\n/)){
  try{const real=fs.realpathSync(name);if(real.endsWith('npm-cli.js'))candidates.push(real);}catch{}
  candidates.push(join(dirname(name),'node_modules/npm/bin/npm-cli.js'));
 }
 const selected=candidates.find(file=>fs.existsSync(file));
 if(!selected)throw Error('npm CLI was not found. Install npm with Node.js 22; this script does not download a package manager.');
 return selected;
}

export async function runCloudSetup({install=false,root=repositoryRoot}={}){
 const runtime=preflight(root);
 console.log('Setup: Node '+process.versions.node+', Python '+runtime.pythonVersion+'.');
 if(install){
  const folder=fs.mkdtempSync(join(tmpdir(),'aqai-cloud-npm-'));
  const config=join(folder,'npmrc');fs.writeFileSync(config,'');
  try{
   runCommand('Install locked public npm packages (lifecycle scripts disabled)',process.execPath,
    [npmCLI(),'ci','--ignore-scripts','--no-audit','--no-fund','--registry=https://registry.npmjs.org',
     '--cache='+join(tmpdir(),'aquidneckai-npm-cache'),'--userconfig='+config],
    {root,offline:false,timeout:300000});
  }finally{fs.unlinkSync(config);fs.rmdirSync(folder);}
 }else if(!fs.existsSync(resolve(root,'node_modules/typescript/bin/tsc'))){
  throw Error('Dependencies are not installed. Run node scripts/cloud-setup.mjs --install to allow npm package downloads, then offline verification.');
 }
 await runCloudChecks({root});
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 if(args.some(arg=>arg!=='--install')||args.length>1){console.error('Usage: node scripts/cloud-setup.mjs [--install]');process.exitCode=1;}
 else try{await runCloudSetup({install:args.includes('--install')});}catch(error){console.error(error.message);process.exitCode=1;}
}
