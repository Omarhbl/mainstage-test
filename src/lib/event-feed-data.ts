import type { UpcomingItem } from "@/lib/upcoming";

export const EVENT_SOURCES = [
  { id: "guichet", name: "Guichet.com", url: "https://guichet.com/ma-fr" },
  { id: "iticket", name: "iTicket.ma", url: "https://api.iticket.ma/fr/v6/promotions?client=web" },
  { id: "ticket", name: "Ticket.ma", url: "https://www.ticket.ma/api/list-events?type=last&limit=300&categoryID=0" },
  { id: "webook", name: "webook.com", url: "https://webook.com/en/explore/ma" },
  { id: "eventsma", name: "Events.ma", url: "https://www.events.ma/chercher-evenements" },
] as const;
export type EventSourceId = (typeof EVENT_SOURCES)[number]["id"];
export type TicketEvent = UpcomingItem & { venue: string; city: string; sources: string[]; observedAt?: string };
export type EventSourceState = { id: EventSourceId; name: string; items: TicketEvent[]; checkedAt: string; syncedAt: string | null; error: string | null; method?: "direct" | "search" };
export type EventFeed = { items: TicketEvent[]; sources: EventSourceState[]; checkedAt: string; error: string | null };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const CITIES = ["Casablanca", "Rabat", "Marrakech", "Agadir", "Fès", "Fes", "Tanger", "Tangier", "Essaouira", "Meknès", "Kénitra", "Oujda", "Tétouan", "El Jadida", "Bouskoura", "Salé", "Safi", "Dakhla", "Ifrane", "Skhirat", "Béni Mellal", "Khouribga", "Laâyoune", "Mohammedia", "Bouznika", "Berkane", "Ouarzazate", "Nador"];
export function eventToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Casablanca", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
export function localDate(value: unknown): string {
  if (typeof value !== "string") return "";
  const french = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  const result = french ? `${french[3]}-${french[2]}-${french[1]}` : /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : "";
  const parsed = new Date(result + "T12:00:00Z");
  return result && Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === result ? result : "";
}
function safeUrl(value: unknown, base?: string, image = false) {
  try { const url = new URL(String(value ?? ""), base); if (url.protocol !== "https:") return "";
    if (image) return /\.(?:jpg|jpeg|png|webp|avif)(?:\?|$)/i.test(url.href) || /(?:cdn|images|media)/i.test(url.hostname) ? url.href : "";
    return ["guichet.com", "www.guichet.com", "iticket.ma", "www.iticket.ma", "ticket.ma", "www.ticket.ma", "webook.com", "www.webook.com", "events.ma", "www.events.ma"].includes(url.hostname) ? url.href : "";
  } catch { return ""; }
}
function makeEvent(input: { id: unknown; title: unknown; image: unknown; date: unknown; href: unknown; venue?: unknown; city?: unknown }, source: EventSourceId, now: Date): TicketEvent | null {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const releaseDate = localDate(input.date);
  const image = safeUrl(input.image, undefined, true), href = safeUrl(input.href);
  const venue = typeof input.venue === "string" ? input.venue.trim() : "";
  const city = typeof input.city === "string" ? input.city.trim() : CITIES.find((city) => normalize(venue).includes(normalize(city))) ?? "";
  if (!title || !releaseDate || releaseDate < eventToday(now) || !image || !href) return null;
  return { id: `${source}-${input.id}`, title, releaseDate, image, href, venue, city, sources: [source] };
}
// Decode only JSON data embedded in the public page; never execute remote scripts.
function readJson(text: string, start: number): unknown {
  let depth = 0, quoted = false, escaped = false;
  for (let index = start; index < text.length; index++) {
    const char = text[index];
    if (quoted) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === '"') quoted = false; continue; }
    if (char === '"') quoted = true;
    else if (char === "[" || char === "{") depth++;
    else if (char === "]" || char === "}") { if (--depth === 0) return JSON.parse(text.slice(start, index + 1)); }
  }
  return null;
}
function walk(value: unknown, visit: (row: Record<string, unknown>) => void, depth = 0) {
  if (!value || typeof value !== "object" || depth > 50) return;
  if (Array.isArray(value)) value.forEach((item) => walk(item, visit, depth + 1));
  else { visit(value as Record<string, unknown>); Object.values(value).forEach((item) => walk(item, visit, depth + 1)); }
}
export function parseGuichetEvents(html: string, now = new Date()): TicketEvent[] {
  let flight = "";
  for (const match of html.matchAll(/self\.__next_f\.push\((\[[\s\S]*?\])\)<\/script>/g)) {
    const chunk = JSON.parse(match[1]); if (typeof chunk[1] === "string") flight += chunk[1];
  }
  const items: TicketEvent[] = []; let recognized = false;
  for (const match of flight.matchAll(/\b[0-9a-f]+:(?=[\[{])/g)) {
    let value: unknown; try { value = readJson(flight, match.index! + match[0].length); } catch { continue; }
    walk(value, (row) => {
      if (!row.startAt || !row.city || !row.place) return;
      recognized = true;
      if (row.available === false || !String(row.reference ?? "").startsWith("MAEV")) return;
      const city = (row.city as { name?: string }).name ?? "";
      if (!CITIES.some((entry) => normalize(entry) === normalize(city))) return;
      const item = makeEvent({ id: row.id, title: row.title, image: row.cover, date: row.startAt, href: `https://guichet.com/ma-fr/${row.slug}`, city, venue: (row.place as { name?: string }).name }, "guichet", now);
      if (item) items.push(item);
    });
  }
  if (!recognized) throw new Error("Public catalogue unavailable or format changed.");
  return mergeTicketEvents(items);
}
export function parseIticketEvents(html: string, now = new Date()): TicketEvent[] {
  const match = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error("Public catalogue unavailable or format changed.");
  const data: unknown[] = JSON.parse(match[1]);
  const resolve = (index: unknown, depth = 0): unknown => {
    if (typeof index !== "number" || index < 0 || depth > 10) return null;
    const value = data[index];
    if (Array.isArray(value)) return value.map((item) => resolve(item, depth + 1));
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolve(item, depth + 1)]));
    return value;
  };
  const items: TicketEvent[] = [];
  for (let index = 0; index < data.length; index++) {
    const raw = data[index]; if (!raw || typeof raw !== "object" || !("event_starts_at" in raw)) continue;
    const row = resolve(index) as Record<string, unknown>;
    if (row.public_state !== 1 || row.hide_dates) continue;
    const venues = row.venues as { name?: string }[] | null;
    const item = makeEvent({ id: row.id, title: row.name, image: row.square_card_url || row.slide_url, date: row.event_starts_at, href: `https://iticket.ma/events/${row.category_slug}/${row.slug}`, venue: venues?.[0]?.name }, "iticket", now);
    if (item) {
      const previous = items.find((entry) => entry.id === item.id);
      if (previous && row.square_card_url) previous.image = item.image;
      else if (!previous) items.push(item);
    }
  }
  return mergeTicketEvents(items);
}
export function parseTicketEvents(payload: unknown, now = new Date()): TicketEvent[] {
  const list = (payload as { list?: unknown[] })?.list;
  if (!Array.isArray(list)) throw new Error("Public catalogue unavailable or format changed.");
  return mergeTicketEvents(list.flatMap((raw) => {
    const row = raw as Record<string, unknown>;
    if (!row || row.cancelled || row.postponed || row.soldout) return [];
    const city = String(row.city ?? ""); if (!CITIES.some((entry) => normalize(entry) === normalize(city))) return [];
    const slug = String(row.deeplink ?? "").split("/")[3]; if (!slug || !row.category_alias) return [];
    const item = makeEvent({ id: row.id, title: row.title, image: row.image, date: row.event_start_date, href: `https://www.ticket.ma/ticket/${row.category_alias}/${row.id}/${slug}`, venue: row.theater_location, city }, "ticket", now);
    return item ? [item] : [];
  }));
}
export function parseStructuredEvents(html: string, source: "webook" | "eventsma", now = new Date()): TicketEvent[] {
  const items: TicketEvent[] = []; let recognized = false;
  for (const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)) {
    let value: unknown; try { value = JSON.parse(match[1]); } catch { continue; }
    walk(value, (row) => {
      if (!String(row["@type"]).includes("Event")) return;
      recognized = true;
      if (/Cancelled|Postponed/.test(String(row.eventStatus))) return;
      const location = row.location as { name?: string; address?: { addressCountry?: string | { name?: string }; addressLocality?: string } } | undefined;
      const country = location?.address?.addressCountry;
      const countryName = typeof country === "string" ? country : country?.name;
      if (!countryName || !["ma", "maroc", "morocco"].includes(normalize(countryName))) return;
      const image = Array.isArray(row.image) ? row.image[0] : row.image;
      const item = makeEvent({ id: row.url, title: row.name, image, date: row.startDate, href: row.url, venue: location?.name, city: location?.address?.addressLocality }, source, now);
      if (item) items.push(item);
    });
  }
  if (!recognized) throw new Error("Public catalogue unavailable or format changed.");
  return mergeTicketEvents(items);
}
export function mergeTicketEvents(items: TicketEvent[]): TicketEvent[] {
  const result: TicketEvent[] = [];
  const key = (title: string) => [...new Set(normalize(title.replace(/\s[-–—|]\s(?:events\.ma|iticket(?:\.ma)?|ticket\.ma|webook(?:\.com)?).*$/i, "")).split(" ").filter((word) => !["en", "concert", "a", "de", "the", "le", "la", "les", "par", "at", "live", "et", "and"].includes(word)))];
  for (const item of items) {
    const words = key(item.title);
    const existing = result.find((entry) => {
      if (entry.href === item.href) return true;
      if (entry.releaseDate !== item.releaseDate) return false;
      const samePlace = entry.venue && item.venue && normalize(entry.venue) === normalize(item.venue);
      const sameCity = entry.city && item.city && normalize(entry.city) === normalize(item.city);
      if (!samePlace && !sameCity) return false;
      const other = key(entry.title), shared = words.filter((word) => other.includes(word)).length;
      return normalize(entry.title) === normalize(item.title) || (Math.min(words.length, other.length) >= 3 && shared / Math.min(words.length, other.length) >= 0.8);
    });
    if (existing) { existing.sources = [...new Set([...existing.sources, ...item.sources])]; continue; }
    result.push({ ...item, sources: [...item.sources] });
  }
  return result.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate) || a.title.localeCompare(b.title)).slice(0, 50);
}

export function parseIticketCatalogue(payload: unknown, now = new Date()): TicketEvent[] {
  const catalogue = payload as { status?: number; response?: unknown[] };
  if (catalogue?.status !== 200 || !Array.isArray(catalogue.response)) throw new Error("iTicket catalogue unavailable.");
  const items: TicketEvent[] = [];
  walk(catalogue.response, (row) => {
    if (!row.event_starts_at || row.public_state !== 1 || row.hide_dates || typeof row.slug !== "string" || typeof row.category_slug !== "string") return;
    const venues = row.venues as { name?: string }[] | undefined;
    const item = makeEvent({ id: row.id, title: row.name, image: row.square_card_url || row.slide_url, date: row.event_starts_at, href: `https://iticket.ma/events/${row.category_slug}/${row.slug}`, venue: venues?.[0]?.name }, "iticket", now);
    if (!item) return;
    const previous = items.find((entry) => entry.id === item.id);
    if (previous && row.square_card_url) previous.image = item.image;
    else if (!previous) items.push(item);
  });
  return mergeTicketEvents(items);
}

export function parseIticketSnapshot(payload: unknown, now = new Date()): { items: TicketEvent[]; syncedAt: string } {
  const feed = payload as { source?: string; syncedAt?: string; items?: TicketEvent[] };
  const age = now.getTime() - Date.parse(feed?.syncedAt ?? '');
  if (feed?.source !== 'iticket' || !Array.isArray(feed.items) || !Number.isFinite(age) || age < -300000 || age > 24 * 60 * 60 * 1000) throw new Error('Scheduled iTicket feed is unavailable or stale.');
  const items = feed.items.flatMap((row) => {
    const item = makeEvent({ id: row.id, title: row.title, image: row.image, date: row.releaseDate, href: row.href, venue: row.venue, city: row.city }, 'iticket', now);
    if (!item || !new URL(item.href!).hostname.match(/^(www\.)?iticket\.ma$/)) return [];
    return [{ ...item, id: row.id }];
  });
  return { items: mergeTicketEvents(items), syncedAt: feed.syncedAt! };
}

export type DiscoveryDraft = { url: string; title: string; reasons: string[]; evidence: string };
export type DiscoverySource = { id: EventSourceId; checkedAt: string; error: string | null; items: TicketEvent[]; drafts: DiscoveryDraft[] };
export type DiscoveryFeed = { version: number; syncedAt: string; sources: DiscoverySource[] };

export function discoverySourceUrl(value: unknown): { source: EventSourceId; url: string } | null {
  const href = safeUrl(value);
  if (!href) return null;
  const url = new URL(href);
  const host = url.hostname.replace(/^www\./, "");
  const source = ({ "iticket.ma": "iticket", "ticket.ma": "ticket", "webook.com": "webook", "events.ma": "eventsma" } as Record<string, EventSourceId>)[host];
  if (!source) return null;
  const path = url.pathname;
  if (source === "iticket" && !/^\/events\/[^/]+\/[^/]+\/?$/.test(path)) return null;
  if (source === "ticket" && !/^\/ticket\/[^/]+\/[^/]+\/[^/]+\/?$/.test(path)) return null;
  if (source === "webook" && !/\/ma\/.+\/events\/[^/]+\/?$/.test(path)) return null;
  if (source === "eventsma" && (!/^\/[^/]+\/[^/]+\/?$/.test(path) || /chercher-evenements|producteur|organisateur|artistes|categorie|page|contact|termes|privacy/.test(path))) return null;
  url.search = ""; url.hash = "";
  return { source, url: url.href };
}

// Search snippets alone never publish an event. Require an event-specific page,
// one explicit full date, a Moroccan city and a poster whose alt text matches.
export function discoverEvent(input: { url: string; title: string; content?: string; raw_content?: string }, now = new Date()): { item: TicketEvent | null; draft: DiscoveryDraft | null } {
  const target = discoverySourceUrl(input.url);
  if (!target) return { item: null, draft: null };
  const text = String(input.raw_content ?? "").slice(0, 30000);
  const primary = text.split(/\n#{1,4}\s+(?:autres|related|similar|vous aimerez|événements similaires|other events)/i)[0];
  const title = String(input.title ?? "").split(/\s+[|–—-]\s+(?:Billets|Tickets|Ticketing|iTicket|Ticket\.ma|webook|Billetterie|Events(?:\.ma)?\b)/i)[0].trim().slice(0, 200);
  const dates = new Set<string>();
  const dateText = primary.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/https?:\/\/\S+/g, "");
  for (const match of dateText.matchAll(/\b(?:\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})\b/g)) { const date = localDate(match[0]); if (date) dates.add(date); }
  const months = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
  for (const match of normalize(dateText).matchAll(/\b(\d{1,2}) (janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre) (20\d{2})\b/g)) {
    const date = localDate(`${match[3]}-${String(months.indexOf(match[2]) + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`);
    if (date) dates.add(date);
  }
  const englishMonths = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  for (const match of normalize(dateText).matchAll(/\b(\d{1,2}) (january|february|march|april|may|june|july|august|september|october|november|december) (20\d{2})\b/g)) {
    const date = localDate(`${match[3]}-${String(englishMonths.indexOf(match[2]) + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`);
    if (date) dates.add(date);
  }
  const releaseDate = dates.size === 1 ? [...dates][0] : "";
  if (releaseDate && releaseDate < eventToday(now)) return { item: null, draft: null };
  if (/\b(annule|reporte|cancelled|canceled|postponed|sold out|complet)\b/.test(normalize(primary))) return { item: null, draft: null };
  const city = CITIES.find((entry) => new RegExp(`\\b${normalize(entry)}\\b`).test(normalize(primary))) ?? "";
  const tokens = normalize(title).split(" ").filter((token) => token.length > 2);
  const matchesTitle = (value: string) => tokens.length >= 2 && tokens.filter((token) => normalize(value).split(" ").includes(token)).length / tokens.length >= 0.7;
  const headings = [...primary.matchAll(/^#{1,2}\s+(.+)$/gm)].map((match) => match[1]);
  const posters = [...primary.matchAll(/!\[([^\]]+)\]\((https:\/\/[^\s)]+)(?:\s+"[^"]*")?\)/g)].filter((match) => matchesTitle(match[1])).map((match) => safeUrl(match[2], undefined, true)).filter(Boolean);
  const uniquePosters = [...new Set(posters)];
  const reasons = [!primary && "Page content unavailable", !headings.some(matchesTitle) && "Event heading needs verification", dates.size !== 1 && "Missing or conflicting event date", !city && "Moroccan location needs verification", uniquePosters.length !== 1 && "Poster needs verification"].filter(Boolean) as string[];
  if (reasons.length) return { item: null, draft: { url: target.url, title, reasons, evidence: (primary || input.content || "").slice(0, 1200) } };
  const item = makeEvent({ id: target.url, title, image: uniquePosters[0], date: releaseDate, href: target.url, city }, target.source, now);
  return { item, draft: item ? null : { url: target.url, title, reasons: ["Incomplete event details"], evidence: primary.slice(0, 1200) } };
}

export function validateDiscoveryFeed(payload: unknown, now = new Date()): DiscoveryFeed {
  const feed = payload as DiscoveryFeed;
  const age = now.getTime() - Date.parse(feed?.syncedAt ?? "");
  if (feed?.version !== 1 || !Array.isArray(feed.sources) || !Number.isFinite(age) || age < -300000 || age > 48 * 60 * 60 * 1000) throw new Error("Discovery feed is missing or stale.");
  const sources = feed.sources.flatMap((source) => {
    if (!["iticket", "ticket", "webook", "eventsma"].includes(source?.id)) return [];
    const sourceAge = now.getTime() - Date.parse(source.checkedAt);
    if (!Number.isFinite(sourceAge) || sourceAge < -300000 || sourceAge > 48 * 60 * 60 * 1000) return [];
    const items = (Array.isArray(source.items) ? source.items : []).slice(0, 50).flatMap((row) => {
      const target = discoverySourceUrl(row?.href);
      if (!target || target.source !== source.id) return [];
      const observedAt = row.observedAt || source.checkedAt;
      const observedAge = now.getTime() - Date.parse(observedAt);
      if (!Number.isFinite(observedAge) || observedAge < -300000 || observedAge > 48 * 60 * 60 * 1000) return [];
      const item = makeEvent({ id: target.url, title: row.title, image: row.image, date: row.releaseDate, href: target.url, city: row.city, venue: row.venue }, source.id, now);
      return item ? [{ ...item, observedAt }] : [];
    });
    const drafts = (Array.isArray(source.drafts) ? source.drafts : []).slice(0, 30).flatMap((row) => {
      const target = discoverySourceUrl(row?.url);
      if (!target || target.source !== source.id || typeof row.title !== "string" || !Array.isArray(row.reasons)) return [];
      return [{ url: target.url, title: row.title.slice(0, 200), reasons: row.reasons.filter((reason) => typeof reason === "string").slice(0, 6), evidence: String(row.evidence ?? "").slice(0, 1200) }];
    });
    return [{ id: source.id, checkedAt: source.checkedAt, error: source.error ? "Search import unavailable for this platform." : null, items: mergeTicketEvents(items), drafts }];
  });
  return { version: 1, syncedAt: feed.syncedAt, sources };
}
