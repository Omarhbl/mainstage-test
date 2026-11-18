import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require=createRequire(import.meta.url),ts=require('typescript'),exports={};
runInNewContext(ts.transpileModule(readFileSync(new URL('../src/lib/radio-playback.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports});
const {setRadioVolume,toggleRadioMute,radioPollDelay}=exports;
test('mute silences audio without pausing or losing the volume to restore',()=>{
 const audio={volume:0.43,muted:false,paused:false,currentTime:42};
 assert.equal(toggleRadioMute(audio,0.43),true);assert.equal(audio.volume,0.43);assert.equal(audio.paused,false);assert.equal(audio.currentTime,42);
 assert.equal(toggleRadioMute(audio,0.43),false);assert.equal(audio.volume,0.43);
});
test('unmute restores an audible level from a zero slider and moving the slider unmutes',()=>{
 const audio={volume:0,muted:true};
 toggleRadioMute(audio,0.6);assert.equal(audio.volume,0.6);assert.equal(audio.muted,false);
 setRadioVolume(audio,0);assert.equal(audio.muted,true);
 setRadioVolume(audio,0.25);assert.equal(audio.volume,0.25);assert.equal(audio.muted,false);
 setRadioVolume(audio,2);assert.equal(audio.volume,1);
 setRadioVolume(audio,-1);assert.equal(audio.volume,0);
 toggleRadioMute(audio,0);assert.equal(audio.volume,0.8);assert.equal(audio.muted,false);
});
test('refresh checks accelerate at transitions, stay bounded and tolerate missing timing',()=>{
 for (const remaining of [0,1,2,3]) assert.equal(radioPollDelay(remaining),1000);
 assert.equal(radioPollDelay(4),2000);
 for (const remaining of [100,null,undefined,NaN]) assert.equal(radioPollDelay(remaining),5000);
});
