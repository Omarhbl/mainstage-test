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
