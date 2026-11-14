import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { parseTicketRenderedCards } from '../src/lib/event-feed-data.ts';

// Read the same public cards a visitor sees. No private APIs or credentials.
const require = createRequire(resolve(process.env.PLAYWRIGHT_PACKAGE_ROOT || '.', 'package.json'));
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ locale: 'fr-FR' });
  const response = await page.goto('https://www.ticket.ma/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (!response?.ok()) throw new Error(`Public catalogue HTTP ${response?.status()}; previous feed preserved.`);
  await page.locator('a[href*="/ticket/"]:has(h3):has(img[alt="calendar"])').first().waitFor({ state: 'attached', timeout: 45000 });
  const cards = await page.locator('a[href*="/ticket/"]').evaluateAll((anchors) => anchors
    .filter((a) => a.querySelector('h3') && a.querySelector('img[alt="calendar"]'))
    .map((a) => ({
      title: a.querySelector('h3').textContent,
      href: a.href,
      image: a.querySelector('img[data-nimg="fill"]')?.src || '',
      dateText: a.querySelector('img[alt="calendar"]').parentElement.querySelector('p')?.textContent || '',
      venue: a.querySelector('img[alt="map"]')?.parentElement.querySelector('p')?.textContent || '',
      statusText: a.innerText,
      soldOut: !!a.querySelector('img[alt="sold out"]'),
    })));
  const now = new Date();
  const items = parseTicketRenderedCards(cards, now);
  if (!items.length) throw new Error('No verified upcoming Morocco events found; previous feed preserved.');
  await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
  await writeFile(new URL('../src/data/ticket-events.json', import.meta.url), JSON.stringify({ source: 'ticket', syncedAt: now.toISOString(), items }, null, 2) + '\n');
  console.log(`Read ${cards.length} public cards; saved ${items.length} upcoming Ticket.ma events.`);
} finally {
  await browser.close();
}
