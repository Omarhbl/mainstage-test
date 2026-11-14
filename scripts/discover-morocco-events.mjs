import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { EVENT_SOURCES, discoverySourceUrl, discoverEvent, mergeTicketEvents, validateDiscoveryFeed } from '../src/lib/event-feed-data.ts';

const key = process.env.TAVILY_API_KEY;
if (!key) throw new Error('Save TAVILY_API_KEY in repository Actions secrets before running discovery.');
const output = new URL('../src/data/event-discovery.json', import.meta.url);
const now = new Date();
let previous;
try { previous = validateDiscoveryFeed(JSON.parse(await readFile(output, 'utf8')), now); } catch { /* First run or expired feed. */ }

async function tavily(endpoint, body) {
  const response = await fetch(`https://api.tavily.com/${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });
  // Do not log response bodies: provider errors may echo authentication details.
  if (!response.ok) throw new Error(`Search provider returned HTTP ${response.status}.`);
  return response.json();
}

const months = [0, 1].map((offset) => new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'Africa/Casablanca' }).format(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 15))));
const sources = [];
let successful = 0;
for (const platform of EVENT_SOURCES.filter((source) => source.id !== 'guichet')) {
  try {
    const domain = ({ iticket: 'iticket.ma', ticket: 'ticket.ma', webook: 'webook.com', eventsma: 'events.ma' })[platform.id];
    const found = new Map();
    // Eight basic searches and at most twenty extractions per daily run.
    for (const month of months) {
      const response = await tavily('search', {
        query: `site:${domain}${platform.id === 'iticket' ? '/events/' : platform.id === 'ticket' ? '/ticket/' : ''} "${month}" Maroc concerts spectacles billets`,
        include_domains: [domain], search_depth: 'basic', max_results: 8,
        include_answer: false, include_raw_content: 'markdown',
      });
      if (!Array.isArray(response.results)) throw new Error('Search response format changed.');
      for (const result of response.results) {
        const target = discoverySourceUrl(result.url);
        if (target?.source === platform.id && typeof result.title === 'string') found.set(target.url, { ...result, url: target.url });
      }
    }
    const candidates = [...found.values()].slice(0, 5);
    if (candidates.length) {
      const extracted = await tavily('extract', { urls: candidates.map((entry) => entry.url), extract_depth: 'basic', include_images: true, format: 'markdown' });
      for (const result of extracted.results ?? []) {
        const target = discoverySourceUrl(result.url);
        const entry = target && found.get(target.url);
        if (entry && result.raw_content) {
          const existing = discoverEvent(entry, now);
          const replacement = discoverEvent({ ...entry, raw_content: result.raw_content }, now);
          // Extraction sometimes drops the event poster. Keep the richer version.
          if (replacement.item || (!existing.item && (replacement.draft?.reasons.length ?? 0) < (existing.draft?.reasons.length ?? 0))) entry.raw_content = result.raw_content;
        }
      }
    }
    const items = [], drafts = [], excluded = new Set();
    for (const candidate of candidates) {
      const result = discoverEvent(candidate, now);
      if (result.item) items.push({ ...result.item, observedAt: now.toISOString() });
      if (result.draft) drafts.push(result.draft);
      if (!result.item && !result.draft) excluded.add(candidate.url);
    }
    const retained = previous?.sources.find((source) => source.id === platform.id)?.items.filter((item) => !excluded.has(item.href)) ?? [];
    sources.push({ id: platform.id, checkedAt: now.toISOString(), error: null, items: mergeTicketEvents([...items, ...retained]), drafts: drafts.filter((draft) => !items.some((item) => item.href === draft.url) && !retained.some((item) => item.href === draft.url)) });
    successful++;
    console.log(`${platform.name}: ${items.length} ready, ${drafts.length} to review.`);
  } catch (error) {
    const saved = previous?.sources.find((source) => source.id === platform.id);
    sources.push(saved ? { ...saved, error: 'Latest search import failed; previous results retained.' } : { id: platform.id, checkedAt: now.toISOString(), error: 'Search import unavailable.', items: [], drafts: [] });
    console.error(`${platform.name}: ${error.message}`);
  }
}
if (!successful) throw new Error('No platforms searched successfully; previous feed preserved.');
await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
await writeFile(output, JSON.stringify({ version: 1, syncedAt: now.toISOString(), sources }, null, 2) + '\n');
