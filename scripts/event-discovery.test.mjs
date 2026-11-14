import test from 'node:test';
import assert from 'node:assert/strict';
import { discoverEvent, discoverySourceUrl, validateDiscoveryFeed } from '../src/lib/event-feed-data.ts';

const now = new Date('2026-11-14T12:00:00Z');
const event = {
  url: 'https://iticket.ma/events/concerts/test-concert?utm_source=search',
  title: 'Concert Test Casablanca – Billets iTicket',
  raw_content: '# Concert Test Casablanca\n21 novembre 2026\nThéâtre, Casablanca, Maroc\n![Concert Test Casablanca](https://cdn.iticket.ma/poster.jpg)',
};

test('complete event publishes with canonical booking link and explicit calendar date', () => {
  const { item, draft } = discoverEvent(event, now);
  assert.equal(draft, null);
  assert.equal(item.releaseDate, '2026-11-21');
  assert.equal(item.city, 'Casablanca');
  assert.equal(item.href, 'https://iticket.ma/events/concerts/test-concert');
  assert.deepEqual(item.sources, ['iticket']);
});
test('snippets alone and missing years remain in review', () => {
  assert.equal(discoverEvent({ ...event, raw_content: '', content: 'Concert 21 novembre 2026 Casablanca' }, now).item, null);
  assert.equal(discoverEvent({ ...event, raw_content: event.raw_content.replace('2026', '') }, now).item, null);
});
test('conflicting dates and mismatched posters remain in review', () => {
  assert.equal(discoverEvent({ ...event, raw_content: event.raw_content + '\n22 novembre 2026' }, now).item, null);
  assert.equal(discoverEvent({ ...event, raw_content: event.raw_content.replace('![Concert Test Casablanca]', '![Another performer]') }, now).item, null);
});
test('past, cancelled and postponed events never publish', () => {
  assert.deepEqual(discoverEvent({ ...event, raw_content: event.raw_content.replace('21 novembre', '10 novembre') }, now), { item: null, draft: null });
  for (const state of ['Annulé', 'Reporté', 'Sold out']) assert.equal(discoverEvent({ ...event, raw_content: event.raw_content + `\n${state}` }, now).draft, null);
});
test('missing Moroccan locality and event heading remain in review', () => {
  assert.equal(discoverEvent({ ...event, raw_content: event.raw_content.replaceAll('Casablanca', 'Riyadh') }, now).item, null);
  assert.equal(discoverEvent({ ...event, raw_content: event.raw_content.replace('# Concert Test Casablanca', '# Other Event') }, now).item, null);
});
test('related event dates do not contaminate the primary event', () => {
  assert(discoverEvent({ ...event, raw_content: event.raw_content + '\n## Related events\n22 novembre 2026' }, now).item);
});
test('platform SEO suffixes do not prevent a matching title and poster', () => {
  const result = discoverEvent({ ...event, title: 'Concert Test Casablanca - Billetterie Maroc et Afrique - Events.ma' }, now);
  assert.equal(result.item?.title, 'Concert Test Casablanca');
});
test('only supported canonical event detail URLs qualify', () => {
  for (const url of ['https://evil.example/events/test', 'javascript:alert(1)', 'https://iticket.ma/', 'https://events.ma/producteur/work-event-998', 'https://webook.com/en/explore/ma', 'https://iticket.ma.evil.example/events/a/b']) assert.equal(discoverySourceUrl(url), null);
  assert.equal(discoverySourceUrl('https://webook.com/en/ma/cas/sports-event/events/marocvsniger-caf27').source, 'webook');
  assert.equal(discoverySourceUrl('https://events.ma/concerts-festivals/test-concert').source, 'eventsma');
});
test('snapshot rejects stale and future timestamps and isolates invalid booking links', () => {
  const { item } = discoverEvent(event, now);
  const feed = { version: 1, syncedAt: now.toISOString(), sources: [{ id: 'iticket', checkedAt: now.toISOString(), error: null, items: [item], drafts: [] }] };
  assert.equal(validateDiscoveryFeed(feed, now).sources[0].items.length, 1);
  for (const date of ['2026-11-10T12:00:00Z', '2026-11-20T12:00:00Z']) assert.throws(() => validateDiscoveryFeed({ ...feed, syncedAt: date }, now));
  assert.equal(validateDiscoveryFeed({ ...feed, sources: [{ ...feed.sources[0], items: [{ ...item, href: 'https://evil.example/' }] }] }, now).sources[0].items.length, 0);
  assert.equal(validateDiscoveryFeed({ ...feed, sources: [{ ...feed.sources[0], checkedAt: '2026-11-10T12:00:00Z' }] }, now).sources.length, 0);
  assert.equal(validateDiscoveryFeed({ ...feed, sources: [{ ...feed.sources[0], items: [{ ...item, observedAt: '2026-11-10T12:00:00Z' }] }] }, now).sources[0].items.length, 0);
});
