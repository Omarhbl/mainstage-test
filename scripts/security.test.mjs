import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import sanitizeHtml from 'sanitize-html';
import sharp from 'sharp';
import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

function load(file, deps = {}, env = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, { exports, require: name => {
    if (name in deps) return deps[name];
    throw Error(`Unexpected import: ${name}`);
  }, Request, Response, URL, Buffer, Date, console, process: { env }, Uint8Array });
  return exports;
}

const html = load('src/lib/article-rich-text.ts', { 'sanitize-html': sanitizeHtml });
test('sanitizer blocks script schemes, entities, malformed tags and active content', () => {
  for (const url of ['javascript:alert(1)', 'java\tscript:alert(1)', 'java&#x09;script:alert(1)', 'data:text/html,test', '//evil.example']) {
    assert.doesNotMatch(html.sanitizeArticleBodyHtml(`<a href="${url}">x</a>`), /href=/);
  }
  assert.doesNotMatch(html.sanitizeArticleBodyHtml('<img src="https://example.com/a.jpg" onerror="alert(1)"><svg onload=alert(1)><script>alert(1)</script></svg>'), /onerror|onload|<svg|<script/);
  const safe = html.sanitizeArticleBodyHtml('<figure class="article-inline-image" style="width:50%;position:fixed"><img src="/photo.webp" alt="A &amp; B"></figure><a href="https://example.com" target="_blank">Link</a>');
  assert.match(safe, /width:50%/); assert.match(safe, /src="\/photo.webp"/); assert.match(safe, /noopener noreferrer/); assert.doesNotMatch(safe, /position/);
});

test('CSV cells stay text even with formula prefixes and leading whitespace', () => {
  const { escapeCsvValue } = load('src/lib/security/csv.ts');
  for (const value of ['=1+1', '+1', '-1', '@SUM(1)', ' \t=1', '\n=1', '\tplain']) assert.match(escapeCsvValue(value), /^"'/);
  assert.equal(escapeCsvValue('A "quoted" name'), '"A ""quoted"" name"');
});

test('portal authorization ignores forged metadata and denies unassigned users', async () => {
  let mapped = { slug: 'client-a', contactName: 'A' };
  const portal = load('src/lib/supabase/client-portal.ts', {
    'next/navigation': { redirect(url) { throw Error(`redirect:${url}`); } },
    '@/lib/supabase/server': {
      hasSupabaseEnv: () => true,
      createSupabaseServerClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: 'account-a', user_metadata: { role: 'client', client_slug: 'client-b' } } } }) } }),
      getBackstageClientByUserId: async id => { assert.equal(id, 'account-a'); return mapped; },
    },
  });
  assert.equal((await portal.requireClientPortalAccess()).client.slug, 'client-a');
  await assert.rejects(portal.requireClientPortalAccess('client-b'), /redirect:\/backstage\/portal\/client-a/);
  mapped = null;
  await assert.rejects(portal.requireClientPortalAccess(), /error=access/);
});

function fakeDatabase() {
  const rows = new Map();
  return { rows, from() {
    let action = 'read', payload, filters = [];
    const query = {
      select() { return query; }, eq(key, value) { filters.push([key, value]); return query; },
      insert(value) { action = 'insert'; payload = value; return query; },
      update(value) { action = 'update'; payload = value; return query; },
      delete() { action = 'delete'; return query; }, like() { return query; }, lt() { return query; },
      maybeSingle() { return query.then(result => ({ ...result, data: result.data[0] ?? null })); },
      async then(resolve) {
        // Yield so competing requests can read the same version before a CAS.
        await Promise.resolve();
        if (action === 'delete') return resolve({ data: [], error: null });
        if (action === 'insert') {
          if (rows.has(payload.key)) return resolve({ data: [], error: { code: '23505' } });
          rows.set(payload.key, structuredClone(payload)); return resolve({ data: [], error: null });
        }
        const matches = [...rows.values()].filter(row => filters.every(([key, value]) => key === 'value->>count' ? String(row.value.count) === value : row[key] === value));
        if (action === 'update') matches.forEach(row => rows.set(row.key, structuredClone(payload)));
        return resolve({ data: structuredClone(matches), error: null });
      },
    };
    return query;
  } };
}
function submissions(client, env = {}) {
  return load('src/lib/security/submissions.ts', { 'server-only': {}, 'node:crypto': { createHmac }, 'node:net': { isIP }, '@/lib/supabase/server': { createSupabaseAdminClient: () => client } }, { SUPABASE_SERVICE_ROLE_KEY: 'test-only-secret', VERCEL: '1', ...env });
}
test('request parser bounds chunked bodies, rejects foreign origins and malformed input', async () => {
  const guard = submissions(null);
  const request = (body, headers = {}) => new Request('https://www.themainstagent.com/api/contact', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body });
  await assert.rejects(guard.readSubmissionJson(request('x')), /Invalid request/);
  await assert.rejects(guard.readSubmissionJson(request('{}', { origin: 'https://evil.example' })), /not allowed/);
  await assert.rejects(guard.readSubmissionJson(request(JSON.stringify({ a: 'x'.repeat(17000) }))), /too large/);
  assert.equal((await guard.readSubmissionJson(request('{"email":"reader@example.com"}'))).email, 'reader@example.com');
  assert.throws(() => guard.boundedField({ email: 'x'.repeat(255) }, 'email', 254), /shorten/);
  const failure = guard.submissionFailure(Error('private database error'));
  assert.doesNotMatch(await failure.text(), /private database/);
});

test('distributed limiter atomically admits at most five simultaneous contact submissions', async () => {
  const database = fakeDatabase(); const guard = submissions(database);
  const request = new Request('https://www.themainstagent.com/api/contact', { headers: { 'x-vercel-forwarded-for': '192.0.2.3' } });
  const results = await Promise.allSettled(Array.from({ length: 15 }, () => guard.limitSubmission(request, 'contact')));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 5);
  assert.ok(results.filter(result => result.status === 'rejected').every(result => result.reason.status === 429));
  assert.ok([...database.rows.keys()].every(key => !key.includes('192.0.2.3')));
  await assert.rejects(submissions(null).limitSubmission(request, 'contact'), error => error.status === 503);
});

test('image validation rejects disguised files and re-encodes accepted raster bytes', async () => {
  const media = load('src/lib/security/image.ts', { 'server-only': {}, sharp });
  await assert.rejects(media.prepareEditorImage(new File(['<svg></svg>'], 'photo.png', { type: 'image/png' })), /valid static/);
  await assert.rejects(media.prepareEditorImage(new File(['not an image'], 'photo.jpg', { type: 'image/jpeg' })), /valid static/);
  const bytes = await sharp({ create: { width: 10, height: 10, channels: 3, background: 'red' } }).png().toBuffer();
  const output = await media.prepareEditorImage(new File([bytes], 'wrong.svg', { type: 'text/html' }));
  assert.equal(output.contentType, 'image/webp'); assert.equal((await sharp(output.bytes).metadata()).format, 'webp');
});

test('analytics checks authorization before contacting Google', async () => {
  let called = false;
  const api = load('src/app/api/analytics/route.ts', {
    '@/lib/supabase/backoffice': { async requireBackofficeAccess() { throw Error('unauthorized'); } },
    googleapis: { google: { analyticsdata() { called = true; } } },
  });
  await assert.rejects(api.GET(), /unauthorized/); assert.equal(called, false);
});
