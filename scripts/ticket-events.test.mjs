import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTicketRenderedCards, parseTicketSnapshot } from '../src/lib/event-feed-data.ts';
const now = new Date('2026-11-14T12:00:00Z');
const card = { title: 'Peter Pan à Casablanca 15h', href: 'https://www.ticket.ma/ticket/spectacles/123/peter-pan', image: 'https://ticket-assets.s3.us-east-1.amazonaws.com/categories/poster.png', dateText: 'Jeudi 26 Novembre 2026', venue: 'Studio des Arts Vivants - Casablanca', statusText: 'Peter Pan', soldOut: false };
test('rendered cards require a real full date, Moroccan venue, image and official detail link', () => {
  assert.equal(parseTicketRenderedCards([card], now)[0].releaseDate, '2026-11-26');
  for (const invalid of [{ dateText: 'Novembre' }, { dateText: '31 Novembre 2026' }, { venue: 'Paris' }, { image: '' }, { href: 'https://example.com/ticket/spectacles/123/test' }]) assert.equal(parseTicketRenderedCards([{ ...card, ...invalid }], now).length, 0);
});
test('unavailable and past events are excluded, date ranges retain explicit start date', () => {
  for (const invalid of [{ soldOut: true }, { statusText: 'Reporté' }, { statusText: 'Annulé' }, { statusText: 'Complet' }, { dateText: '13 Novembre 2026' }]) assert.equal(parseTicketRenderedCards([{ ...card, ...invalid }], now).length, 0);
  assert.equal(parseTicketRenderedCards([{ ...card, dateText: 'Du Samedi 19 Décembre 2026 Au Dimanche 20 Décembre 2026' }], now)[0].releaseDate, '2026-12-19');
});
test('duplicate cards merge but distinct showtimes remain', () => {
  assert.equal(parseTicketRenderedCards([card, card], now).length, 1);
  assert.equal(parseTicketRenderedCards([card, { ...card, title: 'Peter Pan à Casablanca 20h', href: card.href + '-20h' }], now).length, 2);
});
test('snapshots expire and cannot inject foreign booking links', () => {
  const feed = { source: 'ticket', syncedAt: now.toISOString(), items: parseTicketRenderedCards([card], now) };
  assert.equal(parseTicketSnapshot(feed, now).items[0].imageFit, 'contain');
  assert.throws(() => parseTicketSnapshot({ ...feed, syncedAt: '2026-11-12T12:00:00Z' }, now));
  assert.equal(parseTicketSnapshot({ ...feed, items: [{ ...feed.items[0], href: 'https://example.com' }] }, now).items.length, 0);
});
