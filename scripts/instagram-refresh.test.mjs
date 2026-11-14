import test from 'node:test';
import assert from 'node:assert/strict';
import { instagramRefreshDue } from '../src/lib/instagram-feed-data.ts';

test('reuse a successful check within the hour and refresh in the next hour', () => {
  const now = Date.parse('2026-11-14T23:17:00Z');
  assert.equal(instagramRefreshDue('2026-11-14T23:01:00Z', now), false);
  assert.equal(instagramRefreshDue('2026-11-14T22:59:59Z', now), true);
  assert.equal(instagramRefreshDue('2026-11-14T22:59:59Z', Date.parse('2026-11-14T23:00:00Z')), true);
});

test('missing, malformed and future check times cannot suppress updates', () => {
  const now = Date.parse('2026-11-14T23:17:00Z');
  for (const value of ['', 'invalid', '2026-11-15T00:00:00Z']) assert.equal(instagramRefreshDue(value, now), true);
});
