import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { generateKeyPairSync, createPrivateKey } from 'node:crypto';
const keyModule={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/analytics-key.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:keyModule});
const sampleKey=generateKeyPairSync('rsa',{modulusLength:2048}).privateKey.export({type:'pkcs8',format:'pem'});

const source = ts.transpileModule(fs.readFileSync('src/app/api/analytics/route.ts','utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function route({ configured=true, denied=false, failed=false, empty=false, offline=false }={}) {
  const calls=[];
  const exports={};
  const google={auth:{JWT:class { async authorize() {} }},analyticsdata:()=>({properties:{
    runReport:async request=>{ calls.push(request); if(failed)throw Error('private diagnostic'); return {data:empty?{}:{rows:[{metricValues:[{value:'12'}]}]}}; },
    runRealtimeReport:async()=>{if(offline)throw Error('offline');return {data:{rows:[{metricValues:[{value:'2'}]}]}};},
  }})};
  vm.runInNewContext(source,{exports,Response,console:{error(){}},process:{env:configured?{GA_PROPERTY_ID:'565499788',GA_CLIENT_EMAIL:'test@example.test',GA_PRIVATE_KEY:sampleKey}:{}},require:name=>name==='@/lib/analytics-key'?keyModule:name==='node:crypto'?{createPrivateKey}:name==='googleapis'?{google}:{requireBackofficeAccess:async roles=>{assert.deepEqual(Array.from(roles),['admin','editor']);if(denied)throw Error('unauthorized');}}});
  return {get:exports.GET,calls};
}
test('returns daily sessions and realtime users, with private no-store headers',async()=>{const r=route();const response=await r.get();assert.equal(response.status,200);assert.deepEqual((await response.json()).traffic,{sessions:12,activeUsers:2});assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(r.calls[0].property,'properties/565499788');assert.equal(r.calls[0].requestBody.metrics[0].name,'sessions');});
test('empty daily reports mean zero, unavailable realtime stays unknown',async()=>{const response=await route({empty:true,offline:true}).get();assert.deepEqual((await response.json()).traffic,{sessions:0,activeUsers:null});});
test('report failures do not become zero or expose diagnostics',async()=>{for(const options of [{configured:false},{failed:true}]){const response=await route(options).get();assert.equal(response.status,503);assert.equal((await response.text()).includes('private diagnostic'),false);}});
test('authorization runs before reporting',async()=>{const r=route({denied:true});await assert.rejects(r.get(),/unauthorized/);assert.equal(r.calls.length,0);});

test('normalizes complete JSON, copied fields, quotes, escaped newlines and rewrapped PEM',()=>{
 for(const value of [sampleKey,JSON.stringify({type:'service_account',private_key:sampleKey}),JSON.stringify(sampleKey),`"private_key": ${JSON.stringify(sampleKey)},`,sampleKey.replace(/\n/g,'\\n'),sampleKey.replace(/\n/g,'\\\\n'),sampleKey.replace(/\n/g,' ')]) {
   assert.doesNotThrow(()=>createPrivateKey(keyModule.normalizeAnalyticsKey(value)));
 }
 for(const value of ['','not a key','-----BEGIN PRIVATE KEY-----bad!-----END PRIVATE KEY-----']) assert.throws(()=>keyModule.normalizeAnalyticsKey(value));
});
