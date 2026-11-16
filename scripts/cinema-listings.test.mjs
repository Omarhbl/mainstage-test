import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(path, dependencies = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, require: name => {
    if (name in dependencies) return dependencies[name];
    throw Error(name);
  }, URL, Date, Intl, Map, Set });
  return exports;
}
const rules = load('src/lib/cinema-listing-rules.ts');
const cinema = load('src/lib/cinema-feed-data.ts', { '@/lib/cinema-listing-rules': rules });

test('excludes football fixtures and broadcasts in French, English and Arabic', () => {
  for (const title of ['NIGER vs MAROC', 'Maroc - Brésil', 'Liverpool vs. Real Madrid', 'المغرب ضد مصر', 'Finale Ligue des Champions en direct', 'Football : retransmission du match']) {
    assert.equal(rules.isFootballScreening(title), true, title);
  }
  assert.equal(rules.isFootballScreening('Club A vs Club B', ['Sport']), true);
});

test('keeps films about sport and fictional versus titles', () => {
  for (const title of ['I PLAY ROCKY', 'Shaolin Soccer', 'The Football Factory', 'Godzilla vs Kong', 'Batman v Superman', 'Ford v Ferrari', 'Le Match']) {
    assert.equal(rules.isFootballScreening(title), false, title);
  }
});

test('removes already-cached matches during merging and preserves real movies', () => {
  const entry = title => ({ id: title, title, releaseDate: '2026-11-17', cinemas: ['Cinerji'], image: 'https://example.com/poster.jpg', firstSession: '202611171200', lastSession: '202611171600' });
  const cached = [entry('NIGER vs MAROC'), entry('I PLAY ROCKY')];
  const result = cinema.mergeCinemaMovies([cached]);
  assert.equal(result.length, 1); assert.equal(result[0].title, 'I PLAY ROCKY');
  assert.equal(cached.length, 2);
});

test('filters Cinerji matches before they enter either now-showing or upcoming feeds', () => {
  const media = (id, title, release) => ({ id, title, active: true, cinemaid: 'cinema', releasedate: release, posterpath: 'https://cinemedia.cine.digital/poster.jpg', mediaMediagenreCollection: [{ idgenre: { label: 'Sport' } }] });
  const listings = [media(1, 'NIGER vs MAROC', '2026-11-17'), media(2, 'Club A vs Club B', '2026-11-16'), media(3, 'I PLAY ROCKY', '2026-11-17')];
  const shows = [{ mediaid: { id: 2 }, cinemaid: 'cinema', showtime: '2026-11-16T20:00:00Z' }];
  const result = cinema.parseCinerjiMovies(listings, shows, new Date('2026-11-16T12:00:00Z'));
  assert.equal(result.movies.length, 0);
  assert.equal(result.upcoming.length, 1); assert.equal(result.upcoming[0].title, 'I PLAY ROCKY');
});
