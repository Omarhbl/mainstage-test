import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import fs from 'node:fs';
import vm from 'node:vm';
function load(path, deps = {}) { const exports = {}; vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:name=>deps[name],Date,Set}); return exports; }
const {buildNewsSitemap} = load('src/lib/news-sitemap.ts', {'./seo-data':load('src/lib/seo-data.ts')});
const now = Date.parse('2026-11-15T09:00:00Z');
const story = (slug,date,title=slug) => ({slug,date,title});
test('includes original dates for today and yesterday, excludes old, future and invalid dates',()=>{
 const xml=buildNewsSitemap([story('today','15/11/2026'),story('yesterday','14/11/2026'),story('old','13/11/2026'),story('future','16/11/2026'),story('bad','today')],'https://example.com',now);
 assert.match(xml,/<news:publication_date>2026-11-15<\/news:publication_date>/);
 for(const slug of ['today','yesterday']) assert.ok(xml.includes(`/articles/${slug}`));
 for(const slug of ['old','future','bad']) assert.ok(!xml.includes(`/articles/${slug}`));
});
test('timestamp dates use a rolling 48 hour window and duplicates appear once',()=>{
 const xml=buildNewsSitemap([story('recent','2026-11-13T10:00:00Z'),story('old','2026-11-13T08:00:00Z'),story('future','2026-11-15T10:00:00Z'),story('recent','15/11/2026')],'https://example.com',now);
 assert.equal((xml.match(/<url>/g)||[]).length,1); assert.ok(xml.includes('/articles/recent'));
});
test('escapes XML, limits to 1000 entries and permits an empty sitemap',()=>{
 const xml=buildNewsSitemap([story('test','15/11/2026','Fashion & music <news>')],'https://example.com',now);
 assert.match(xml,/Fashion &amp; music &lt;news&gt;/);
 const many=buildNewsSitemap(Array.from({length:1005},(_,i)=>story(`story-${i}`,'15/11/2026')),'https://example.com',now);
 assert.equal((many.match(/<url>/g)||[]).length,1000);
 assert.ok(!buildNewsSitemap([],'https://example.com',now).includes('<url>'));
});
