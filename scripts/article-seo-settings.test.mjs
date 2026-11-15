import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function settingsModule({ unavailable = false, fail = false } = {}) {
  const rows = new Map();
  const client = { from(table) {
    assert.equal(table, 'site_settings');
    return {
      select() { return { eq(column, key) { assert.equal(column, 'key'); return { async maybeSingle() { return { data: rows.has(key) ? { value: rows.get(key) } : null }; } }; } }; },
      async upsert(row, options) { assert.equal(options.onConflict, 'key'); if (!fail) rows.set(row.key, row.value); return { error: fail ? { message: 'failed' } : null }; },
    };
  } };
  const source = ts.transpileModule(fs.readFileSync(new URL('../src/lib/article-seo-settings.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, require(name) {
    if (name === 'server-only') return {};
    if (name === 'react') return { cache: fn => fn };
    if (name === '@/lib/supabase/server') return { createSupabaseAdminClient: () => unavailable ? null : client };
    throw Error(name);
  }, Date });
  return { api: exports, rows };
}

test('SEO overrides persist independently per article and blank values restore defaults', async () => {
  const { api } = settingsModule();
  const form = new FormData(); form.set('seo_title', '  Concert dates  '); form.set('seo_description', '  Confirmed details  ');
  assert.equal(await api.saveArticleSeoSettings('concert', form), null);
  assert.equal((await api.getArticleSeoSettings('concert')).title, 'Concert dates');
  assert.equal((await api.getArticleSeoSettings('concert')).description, 'Confirmed details');
  assert.equal((await api.getArticleSeoSettings('another')).title, '');
  await api.saveArticleSeoSettings('concert', new FormData());
  assert.equal((await api.getArticleSeoSettings('concert')).title, '');
});
test('limits stored fields and reports a failed save', async () => {
  const { api } = settingsModule(); const form = new FormData(); form.set('seo_title', 'x'.repeat(300)); form.set('seo_description', 'y'.repeat(600));
  await api.saveArticleSeoSettings('story', form);
  assert.equal((await api.getArticleSeoSettings('story')).title.length, 200);
  assert.equal((await api.getArticleSeoSettings('story')).description.length, 500);
  assert.match(await settingsModule({ fail: true }).api.saveArticleSeoSettings('story', form), /could not be saved/);
  assert.equal((await settingsModule({ unavailable: true }).api.getArticleSeoSettings('story')).description, '');
});
