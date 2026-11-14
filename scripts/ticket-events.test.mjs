import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTicketRenderedCards, parseTicketSnapshot, mergeTicketEvents } from '../src/lib/event-feed-data.ts';
const now = new Date('2026-11-14T12:00:00Z');
const card = { title: 'Spectacle familial à Casablanca 15h', href: 'https://www.ticket.ma/ticket/spectacles/123/spectacle-familial', image: 'https://ticket-assets.s3.us-east-1.amazonaws.com/categories/poster.png', dateText: 'Jeudi 26 Novembre 2026', venue: 'Studio des Arts Vivants - Casablanca', statusText: 'Peter Pan', soldOut: false };
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
  assert.equal(parseTicketRenderedCards([card, { ...card, title: 'Spectacle familial à Casablanca 20h', href: card.href + '-20h' }], now).length, 2);
});
test('snapshots expire and cannot inject foreign booking links', () => {
  const feed = { source: 'ticket', syncedAt: now.toISOString(), items: parseTicketRenderedCards([card], now) };
  assert.equal(parseTicketSnapshot(feed, now).items[0].imageFit, 'contain');
  assert.throws(() => parseTicketSnapshot({ ...feed, syncedAt: '2026-11-12T12:00:00Z' }, now));
  assert.equal(parseTicketSnapshot({ ...feed, items: [{ ...feed.items[0], href: 'https://example.com' }] }, now).items.length, 0);
});


test('editorial removals stay hidden across providers and refreshes', () => {
  const base = { id: 'test', title: '', releaseDate: '2026-11-26', image: card.image, href: card.href, city: 'Casablanca', venue: '', sources: ['ticket'] };
  const removed = [
    { title: 'Soirée Aisawiya 100% Femmes', releaseDate: '2026-11-15' },
    { title: 'Une Soirée exceptionnelle avec le talentueux chanteur Maxime', releaseDate: '2026-11-15' },
    { title: 'La Belle et la Bête - Casablanca 11H30', releaseDate: '2026-11-22' },
    { title: 'La belle et la bête - Casablanca 16h', releaseDate: '2026-11-22' },
    { title: 'SOIRÉE ARTISTIQUE & SOLIDAIRE – ADNAE MATRONE À CASABLANCA' },
    { title: 'Soirée artistique – Adnane Matrone à Casablanca' },
    ...['2026-11-26', '2026-11-27', '2026-11-28', '2026-11-29'].map(releaseDate => ({ title: 'PETER PAN ON ICE - 15h', releaseDate })),
    { title: 'Peter Pan on Ice par The International Ice Stars', sources: ['iticket'] },
    { title: 'Peter Pan sur glace', sources: ['webook'] },
  ].map((entry, index) => ({ ...base, ...entry, id: String(index), href: base.href + index }));
  assert.equal(mergeTicketEvents(removed).length, 0);
  const unaffected = [{ ...base, title: 'Soirée Aïssawa avec Yassine ElJamai', releaseDate: '2026-12-04' }, { ...base, href: base.href + 'future', title: 'Peter Pan on Ice', releaseDate: '2027-11-26' }];
  assert.equal(mergeTicketEvents([...removed, ...unaffected]).length, 2);
});

test('cross-platform spelling variants merge and prefer portrait artwork in either order', () => {
  const banner = { id: 'ticket-aissawa', title: 'Soirée Aissaouia - Yassine Jamaï', releaseDate: '2026-12-04', image: 'https://cdn.example/banner.jpg', imageFit: 'contain', href: 'https://www.ticket.ma/ticket/concerts/1/aissawa', city: 'Rabat', venue: 'Salle Bahnini', sources: ['ticket'] };
  const portrait = { ...banner, id: 'guichet-aissawa', title: 'Soirée Aïssawa avec Yassine ElJamai', image: 'https://cdn.example/portrait.jpg', imageFit: undefined, href: 'https://guichet.com/ma-fr/aissawa', sources: ['guichet'] };
  for (const entries of [[banner, portrait], [portrait, banner]]) {
    const merged = mergeTicketEvents(entries);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].image, portrait.image);
    assert.equal(merged[0].href, portrait.href);
    assert.equal(merged[0].imageFit, undefined);
    assert.deepEqual([...merged[0].sources].sort(), ['guichet', 'ticket']);
  }
  assert.equal(mergeTicketEvents([banner, { ...portrait, city: 'Casablanca', venue: 'Other venue' }]).length, 2);
});
