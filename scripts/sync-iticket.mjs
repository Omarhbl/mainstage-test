import { mkdir, writeFile } from 'node:fs/promises';
import { EVENT_SOURCES, parseIticketCatalogue, parseIticketEvents } from '../src/lib/event-feed-data.ts';

// Only publish the normalized public catalogue, never the raw API response.
const source = EVENT_SOURCES.find((entry) => entry.id === 'iticket');
const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'fr-FR,fr;q=0.9',
  },
};
const now = new Date();
let items;
try {
  const response = await fetch(source.url, { ...options, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`API HTTP ${response.status}`);
  items = parseIticketCatalogue(await response.json(), now);
} catch (error) {
  console.log(`Catalogue API unavailable (${error.message}); trying public event page.`);
  const page = await fetch('https://iticket.ma/', { ...options, signal: AbortSignal.timeout(30000) });
  if (!page.ok) throw new Error(`Public event page returned HTTP ${page.status}; previous feed preserved.`);
  items = parseIticketEvents(await page.text(), now);
}
if (!items.length) throw new Error('No upcoming events found; previous feed preserved for review.');
const output = new URL('../src/data/iticket-events.json', import.meta.url);
await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
await writeFile(output, JSON.stringify({ source: 'iticket', syncedAt: now.toISOString(), items }, null, 2) + '\n');
console.log(`Saved ${items.length} public iTicket events.`);
