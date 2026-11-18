import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import fs from 'node:fs';
import vm from 'node:vm';
import sharp from 'sharp';
function load(path, dependencies={}) { const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2017,esModuleInterop:true}}).outputText,{exports,require:name=>{if(name in dependencies)return dependencies[name];throw Error(name);},URL,Date,Set,structuredClone,Buffer,AbortSignal,process:{env:{}}});return exports; }
const radioConstants=load('src/lib/website-radio.ts');
const config=load('src/lib/app-config.ts',{'@/lib/website-radio':radioConstants});
const media=load('src/lib/app-media.ts',{'server-only':{},sharp,'@/lib/app-config':config});
const station={id:'hits',name:'Hits',tagline:'',streamUrl:'',imageUrl:'https://example.com/cover.jpg',color:'#CE2127',order:1,active:true};
const campaign={id:'one',slot:'home_banner',advertiser:'Brand',imageUrl:'https://example.com/ad.jpg',linkUrl:'',startsAt:null,endsAt:null,active:true};
test('rejects insecure links, credentials and incomplete radio settings',()=>{
 for(const url of ['http://example.com/live','https://user:password@example.com/live','/live','javascript:alert(1)'])assert.equal(config.isHttpsUrl(url),false);
 assert.equal(config.isHttpsUrl('https://example.com/live.m3u8'),true);
 assert.throws(()=>config.validateAppSection('radio',{...config.APP_DEFAULTS.radio,streamUrl:''}),/required/);
 assert.throws(()=>config.validateAppSection('switches',{ads:'true',drop:false}),/on or off/);
});
test('validates schedule weekdays and times while supporting overnight shows',()=>{
 const radio={...config.APP_DEFAULTS.radio,streamUrl:'https://example.com/live',schedule:[{days:[1,2],from:'22:00',to:'02:00',show:'Night'}]};
 assert.equal(config.validateAppSection('radio',radio).schedule[0].to,'02:00');
 assert.throws(()=>config.validateAppSection('radio',{...radio,schedule:[{...radio.schedule[0],from:'25:00'}]}),/HH:MM/);
 assert.throws(()=>config.validateAppSection('radio',{...radio,schedule:[{...radio.schedule[0],days:[7]}]}),/Day/);
});
test('caps webradios and rejects repeated or malformed immutable IDs',()=>{
 assert.equal(config.validateAppSection('webradios',[station])[0].streamUrl,'');
 assert.throws(()=>config.validateAppSection('webradios',[station,station]),/unique/);
 assert.throws(()=>config.validateAppSection('webradios',[{...station,id:'Afro House'}]),/lowercase/);
 assert.throws(()=>config.validateAppSection('webradios',Array.from({length:13},(_,i)=>({...station,id:`station-${i}`}))),/maximum 12/);
});
test('blocks overlapping active campaigns but permits adjacent windows and separate slots',()=>{
 assert.throws(()=>config.validateAppSection('ads',[campaign,{...campaign,id:'two'}]),/overlapping/);
 assert.equal(config.validateAppSection('ads',[campaign,{...campaign,id:'two',slot:'home_mrec'}]).length,2);
 assert.equal(config.validateAppSection('ads',[{...campaign,endsAt:'2026-12-01T00:00:00Z'},{...campaign,id:'two',startsAt:'2026-12-01T00:00:00Z'}]).length,2);
 assert.throws(()=>config.validateAppSection('ads',[{...campaign,startsAt:'2026-12-01T00:00:00Z',endsAt:'2026-11-01T00:00:00Z'}]),/end after/);
});
test('public feed sorts without mutating and retains inactive stations so the app does not restore its built-in list',()=>{
 const sections={...config.APP_DEFAULTS,webradios:[{...station,id:'last',order:2,active:false},{...station,order:1}],ads:[{...campaign,endsAt:'2026-11-16T12:00:00Z'}]};
 const result=config.publicAppConfig(sections,'2026-11-16T10:00:00Z',Date.parse('2026-11-16T12:00:00Z'));
 assert.equal(result.webradios[0].id,'hits');assert.equal(result.webradios[1].active,false);assert.equal(sections.webradios[0].id,'last');assert.equal(result.ads.length,0);
 assert.equal(config.publicAppConfig({...sections,switches:{ads:false,drop:false},ads:[campaign]},null).ads.length,0);
});
test('image validation checks actual bytes and placement dimensions',async()=>{
 const bytes=await sharp({create:{width:640,height:200,channels:3,background:'#ff0000'}}).png().toBuffer();
 assert.equal((await media.inspectAppImage(bytes,'home_banner')).width,640);
 await assert.rejects(media.inspectAppImage(bytes,'home_mrec'),/6:5/);
 await assert.rejects(media.inspectAppImage(Buffer.from('not an image'),'radio'));
 assert.throws(()=>media.checkAppImageSize('radio',1000,900),/square/);
 assert.throws(()=>media.checkAppImageSize('webradio',799,800),/800/);
});
test('each app section persists independently and storage failures are surfaced',async()=>{
 const rows=new Map();
 let fail=false;
 const client={from(){return {select(){return {async in(){return {data:[...rows].map(([key,value])=>({key,value,updated_at:'2026-11-16T10:00:00Z'})),error:fail?{}:null};}};},async upsert(row){if(!fail)rows.set(row.key,row.value);return {error:fail?{}:null};}};}};
 const store=load('src/lib/app-config-store.ts',{'server-only':{},'@/lib/supabase/server':{createSupabaseAdminClient:()=>client},'@/lib/app-config':config});
 await store.saveAppSection('switches',{ads:false,drop:false});await store.saveAppSection('webradios',[station]);
 const saved=await store.getAppSettings();assert.equal(saved.sections.switches.ads,false);assert.equal(saved.sections.webradios[0].id,'hits');assert.equal(saved.sections.radio.name,'Mainstage — On Air');
 fail=true;await assert.rejects(store.saveAppSection('switches',{ads:true,drop:true}),/could not be saved/);await assert.rejects(store.getAppSettings(),/could not be loaded/);
});
test('save action checks admin access before storage and only saves validated values',async()=>{
 let authorized=false;let saved;let authenticatedCalls=0;
 const action=load('src/app/backoffice/app/actions.ts',{'next/cache':{revalidatePath(){}},'@/lib/supabase/backoffice':{async requireBackofficeAccess(roles){authenticatedCalls++;assert.equal(roles[0],'admin');if(!authorized)throw Error('unauthorized');}},'@/lib/app-config':config,'@/lib/app-config-store':{async saveAppSection(section,value){saved={section,value};},async getAppSettings(){return {sections:config.APP_DEFAULTS};}},'@/lib/app-media':{async verifyAppImageUrl(){}}});
 const form=new FormData();form.set('section','switches');form.set('settings',JSON.stringify({ads:false,drop:false}));
 await assert.rejects(action.saveAppSettingsAction({ok:false,message:''},form),/unauthorized/);assert.equal(saved,undefined);
 authorized=true;assert.equal((await action.saveAppSettingsAction({ok:false,message:''},form)).ok,true);assert.equal(saved.section,'switches');assert.equal(saved.value.ads,false);
 form.set('settings',JSON.stringify({ads:'invalid',drop:false}));assert.equal((await action.saveAppSettingsAction({ok:false,message:''},form)).ok,false);assert.equal(authenticatedCalls,3);
});
