import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const exports = {};
const compiled = ts.transpileModule(readFileSync(new URL('../src/lib/website-radio.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
runInNewContext(compiled, { exports, URL });
const { parseRadioSnapshot, radioArtwork } = exports;
test('uses station covers, replaces generic art and refuses unsafe/unrelated URLs', () => {
  assert.equal(radioArtwork('https://radio.themainstagent.com/api/station/mainstage/art/cover.jpg'), 'https://radio.themainstagent.com/api/station/mainstage/art/cover.jpg');
  for (const value of ['https://radio.themainstagent.com/static/generic_song-123.jpg', 'javascript:alert(1)', 'http://radio.themainstagent.com/art.jpg', 'https://example.com/tracker.jpg', '', null]) assert.equal(radioArtwork(value), null);
});
test('normalizes offline, missing metadata and bounded history without exposing raw API details', () => {
  const output = parseRadioSnapshot({ is_online: false, listeners: {current: 10}, song_history: Array.from({length: 12}, (_,i) => ({song: {title: `Track ${i}`, artist: 'Artist'}})) });
  assert.equal(output.online, false); assert.equal(output.song.title, 'Mainstage Radio'); assert.equal(output.song.art, null); assert.equal(output.history.length, 8); assert.equal(output.listeners, undefined);
});
test('retains track details and rejects invalid API responses instead of reporting false offline', () => {
  const output = parseRadioSnapshot({ is_online: true, now_playing: {song: {title: 'Track',artist: 'Artist',id:'123'}} });
  assert.equal(output.song.title,'Track'); assert.equal(output.song.artist,'Artist');
  for (const value of [null,{}, {is_online:'false'}]) assert.throws(() => parseRadioSnapshot(value));
});
test('live metadata route fetches each new track without data/CDN caching', async () => {
  const routeExports = {};
  const requests = [];
  const payloads = ['First song','Next song'];
  const source = ts.transpileModule(readFileSync(new URL('../src/app/api/radio/now-playing/route.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  runInNewContext(source, {
    exports: routeExports, require: () => exports, Response, AbortSignal,
    fetch: async (url, options) => { requests.push({url, options}); return Response.json({is_online:true,now_playing:{song:{title:payloads.shift(),artist:'Artist'}}}); },
  });
  const first = await routeExports.GET(); const second = await routeExports.GET();
  assert.equal((await first.json()).song.title,'First song');
  assert.equal((await second.json()).song.title,'Next song');
  assert.match(second.headers.get('Cache-Control'),/no-store/);
  assert.equal(routeExports.dynamic,'force-dynamic');
  assert.equal(requests.length,2);
  for (const request of requests) assert.equal(request.options.cache,'no-store');
});
test('exposes the queued track and hides missing or offline next-track data', () => {
  const queued = { title: 'Coming next', artist: 'Next artist', art: 'https://radio.themainstagent.com/api/station/mainstage/art/next.jpg' };
  const data = parseRadioSnapshot({is_online:true,playing_next:{song:queued}});
  assert.equal(data.next.title,'Coming next'); assert.equal(data.next.artist,'Next artist'); assert.equal(data.next.art,queued.art);
  for (const next of [undefined,null,{}, {song:null}, {song:{title:' '}}]) assert.equal(parseRadioSnapshot({is_online:true,playing_next:next}).next,null);
  assert.equal(parseRadioSnapshot({is_online:false,playing_next:{song:queued}}).next,null);
});
