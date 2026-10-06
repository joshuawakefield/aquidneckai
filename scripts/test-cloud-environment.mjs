import assert from 'node:assert/strict';
import test from 'node:test';
import {cleanEnvironment} from './cloud-check.mjs';

const transportNames=['HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','NO_PROXY',
 'NODE_EXTRA_CA_CERTS','SSL_CERT_FILE','SSL_CERT_DIR'];
const secretNames=['OPENROUTER_API_KEY','SUPABASE_SECRET_KEY','SUPABASE_SERVICE_ROLE_KEY',
 'NPM_TOKEN','NODE_AUTH_TOKEN','NPM_CONFIG_TOKEN','npm_config_registry','GITHUB_TOKEN'];

function withEnvironment(fixture,check){
 const previous=process.env;
 try{process.env={...fixture};check();}finally{process.env=previous;}
}

test('explicit package installation preserves only allowlisted transport configuration across casing',()=>{
 for(const transform of [name=>name,name=>name.toLowerCase(),name=>name[0]+name.slice(1).toLowerCase()]){
  const fixture=Object.fromEntries(transportNames.map(name=>[transform(name),'synthetic-transport-setting']));
  for(const name of secretNames)fixture[name]='synthetic-secret';
  fixture.NODE_OPTIONS='--require=untrusted-hook';
  fixture.AQAI_WORKER_ENABLED='true';
  withEnvironment(fixture,()=>{
   const env=cleanEnvironment({offline:false});
   for(const name of transportNames)assert.ok(env[transform(name)]===fixture[transform(name)],'package install retains approved transport setting');
   for(const name of secretNames)assert.ok(!(name in env),'package install excludes service and package credentials');
   assert.ok(!('NODE_OPTIONS' in env),'package install excludes inherited runtime hooks');
   assert.ok(!('AQAI_CLOUD_OFFLINE_TEST' in env),'package install does not activate the offline guard');
   assert.ok(env.AQAI_WORKER_ENABLED==='false','worker remains disabled');
  });
 }
});

test('offline and default environments strip transport settings and credentials and activate the guard',()=>{
 const fixture={NODE_OPTIONS:'--require=untrusted-hook'};
 for(const name of [...transportNames,...secretNames]){
  fixture[name]='synthetic-setting';fixture[name.toLowerCase()]='synthetic-setting';
 }
 withEnvironment(fixture,()=>{
  for(const env of [cleanEnvironment(),cleanEnvironment({offline:true})]){
   for(const name of Object.keys(env))assert.ok(![...transportNames,...secretNames.map(key=>key.toUpperCase())].includes(name.toUpperCase()),'offline tests exclude transport and service settings');
   assert.ok(env.NODE_OPTIONS===`--import=${new URL('./cloud-check.mjs',import.meta.url).href}`,'offline guard replaces inherited runtime hooks');
   assert.ok(env.AQAI_CLOUD_OFFLINE_TEST==='1','offline network guard is enabled');
   assert.ok(env.AQAI_WORKER_ENABLED==='false'&&env.AQAI_HEALTH_DB_CHECK==='false','worker and database health checks remain disabled');
  }
 });
});
