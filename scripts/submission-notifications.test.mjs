import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeSubmissions } from '../src/lib/submission-notifications.ts';

const before = '2026-11-14T10:00:00.000Z';
const seen = '2026-11-14T11:00:00.000Z';
const after = '2026-11-14T12:00:00.000Z';

test('counts unread submissions from both forms and ignores already-read entries', () => {
  const result = summarizeSubmissions(
    [{ email: 'old@example.com', subscribedAt: before }, { email: 'new@example.com', subscribedAt: after }],
    [{ email: 'read@example.com', subject: 'Read', receivedAt: seen }, { email: 'contact@example.com', subject: 'Partnership', receivedAt: after }],
    seen, after,
  );
  assert.equal(result.guestlistCount, 1);
  assert.equal(result.contactCount, 1);
  assert.equal(result.items.length, 2);
  assert.equal(result.items.find(x => x.kind === 'contact').href, '/backoffice/settings/contact-inbox');
});

test('caps recent previews without losing total unread counts and sorts newest first', () => {
  const signups = Array.from({length: 9}, (_, i) => ({email: `${i}@example.com`, subscribedAt: `2026-11-14T12:0${i}:00.000Z`}));
  const result = summarizeSubmissions(signups, [], '', after);
  assert.equal(result.guestlistCount, 9);
  assert.equal(result.items.length, 6);
  assert.equal(result.items[0].detail, '8@example.com');
});

test('a submission arriving after the displayed snapshot remains unread when marked read', () => {
  const result = summarizeSubmissions([{email: 'late@example.com', subscribedAt: after}], [], seen, after);
  assert.equal(result.guestlistCount, 1);
  assert.equal(summarizeSubmissions([{email: 'read@example.com', subscribedAt: seen}], [], seen, after).items.length, 0);
});
