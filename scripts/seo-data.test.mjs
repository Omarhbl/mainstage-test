import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSeoDate, articleModifiedDate, serializeStructuredData } from '../src/lib/seo-data.ts';

test('uses stable valid dates without inventing publication dates', () => {
  assert.equal(parseSeoDate('14/11/2026'), '2026-11-14T12:00:00.000Z');
  assert.equal(parseSeoDate('2026-11-14T17:30:00+01:00'), '2026-11-14T16:30:00.000Z');
  for (const value of ['', 'today', 'yesterday', '31/02/2026', '2026-02-29', '2026-13-01']) assert.equal(parseSeoDate(value), undefined);
  assert.equal(parseSeoDate('2024-02-29'), '2024-02-29T12:00:00.000Z');
});
test('uses real modification dates and rejects impossible chronology', () => {
  const now = Date.parse('2026-11-15T20:00:00Z');
  assert.equal(articleModifiedDate({date:'14/11/2026', updatedAt:'2026-11-15T10:00:00Z'},now), '2026-11-15T10:00:00.000Z');
  for (const updatedAt of ['2026-11-01T10:00:00Z', '2026-12-01T10:00:00Z', 'invalid']) assert.equal(articleModifiedDate({date:'14/11/2026', updatedAt}, now), '2026-11-14T12:00:00.000Z');
});
test('structured data cannot close its script tag through article text', () => {
  const data = {headline:'A </script><script>alert(1)</script> story'};
  const encoded = serializeStructuredData(data);
  assert.equal(encoded.includes('</script>'), false);
  assert.deepEqual(JSON.parse(encoded), data);
});
