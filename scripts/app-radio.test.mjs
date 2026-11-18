import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
function load(path,deps={},globals={}) {
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:name=>{if(name in deps)return deps[name];throw Error(name);},URL,Date,Set,Response,AbortSignal,...globals});
 return exports;
}
const radio=load('src/lib/website-radio.ts');
const config=load('src/lib/app-config.ts',{'@/lib/website-radio':radio});
const data=load('src/lib/app-radio-data.ts',{'@/lib/website-radio':radio,'@/lib/app-config':config});
const settings=config.APP_DEFAULTS.radio;
const snapshot=radio.parseRadioSnapshot({is_online:true,now_playing:{song:{id:'one',title:'Current song',artist:'Current artist'}},playing_next:{song:{id:'two',title:'Next song',artist:'Next artist'}},song_history:[{song:{title:'Last song',artist:'Last artist'}}]});
test('app config supplies real stream and metadata URLs while preserving saved overrides',()=>{
 const result=config.publicAppConfig(config.APP_DEFAULTS,null);
 assert.equal(result.radio.streamUrl,radio.RADIO_STREAM);
 assert.equal(result.radio.nowPlayingUrl,config.APP_RADIO_NOW_PLAYING_URL);
 assert.equal(result.radio.metadataRefreshSeconds,10);
 assert.equal(result.radio.mediaSession.title,'Mainstage — On Air');
 assert.equal(result.radio.mediaSession.artwork[0].src,radio.RADIO_FALLBACK_ART);
 assert.notEqual(result.updatedAt,new Date(0).toISOString());
 const saved={...settings,name:'Saved station',nowPlayingUrl:'https://example.com/metadata',streamUrl:'https://example.com/audio',artworkUrl:'https://example.com/art.png'};
 const custom=config.publicAppRadio(saved);
 assert.equal(custom.streamUrl,saved.streamUrl); assert.equal(custom.nowPlayingUrl,saved.nowPlayingUrl);assert.equal(custom.mediaSession.title,saved.name);assert.equal(custom.mediaSession.artwork[0].src,saved.artworkUrl);
});
test('native track data changes independently of fixed lock-screen branding and uses fallback covers',()=>{
 const first=data.appRadioNowPlaying(snapshot,settings);
 assert.equal(first.title,'Current song');assert.equal(first.artworkUrl,radio.RADIO_FALLBACK_ART);assert.equal(first.playingNext.title,'Next song');assert.equal(first.recentlyPlayed[0].title,'Last song');
 const second=data.appRadioNowPlaying({...snapshot,song:snapshot.next,next:null},settings);
 assert.equal(second.title,'Next song');assert.equal(second.playingNext,null);assert.equal(first.mediaSession.title,second.mediaSession.title);assert.equal(first.mediaSession.artwork[0].src,second.mediaSession.artwork[0].src);
 const absent=data.appRadioNowPlaying(radio.parseRadioSnapshot({is_online:false}),settings);
 assert.equal(absent.metadataAvailable,false);assert.equal(absent.isOnline,false);assert.equal(absent.title,settings.name);assert.equal(absent.playingNext,null);
});
test('app metadata endpoint is public, fresh, and fails safely for upstream errors or a different stream',async()=>{
 let fail=false,stream=settings.streamUrl,calls=0;
 const route=load('src/app/api/app/radio/now-playing/route.ts',{
  '@/lib/app-config-store':{async getAppSettings(){return {sections:{radio:{...settings,streamUrl:stream}}};}},
  '@/lib/app-radio-data':data,'@/lib/website-radio':radio,
 },{fetch:async(url,options)=>{calls++;assert.equal(url,`${radio.RADIO_BASE}/api/nowplaying/mainstage`);assert.equal(options.cache,'no-store');assert.equal(options.redirect,'error');return fail?new Response('',{status:500}):Response.json({is_online:true,now_playing:{song:{title:'Fresh track',artist:'Artist'}}});}});
 const result=await route.GET();assert.equal(result.status,200);assert.match(result.headers.get('Cache-Control'),/no-store/);assert.equal(result.headers.get('Access-Control-Allow-Origin'),'*');assert.equal((await result.json()).title,'Fresh track');
 fail=true;assert.equal((await route.GET()).status,503);
 stream='https://other.example/live';assert.equal((await route.GET()).status,503);assert.equal(calls,2);
});
