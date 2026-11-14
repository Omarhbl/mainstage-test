import type { UpcomingItem } from "@/lib/upcoming";

export const EVENT_SOURCES = [
  { id: "guichet", name: "Guichet.com", url: "https://guichet.com/ma-fr" },
  { id: "iticket", name: "iTicket.ma", url: "https://api.iticket.ma/fr/v6/promotions?client=web" },
  { id: "ticket", name: "Ticket.ma", url: "https://www.ticket.ma/api/list-events?type=last&limit=300&categoryID=0" },
  { id: "webook", name: "webook.com", url: "https://webook.com/en/explore/ma" },
  { id: "eventsma", name: "Events.ma", url: "https://www.events.ma/chercher-evenements" },
] as const;
export type EventSourceId = (typeof EVENT_SOURCES)[number]["id"];
export type TicketEvent = UpcomingItem & { venue: string; city: string; sources: string[] };
export type EventSourceState = { id: EventSourceId; name: string; items: TicketEvent[]; checkedAt: string; syncedAt: string | null; error: string | null };
export type EventFeed = { items: TicketEvent[]; sources: EventSourceState[]; checkedAt: string; error: string | null };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const CITIES = ["Casablanca", "Rabat", "Marrakech", "Agadir", "Fès", "Fes", "Tanger", "Tangier", "Essaouira", "Meknès", "Kénitra", "Oujda", "Tétouan", "El Jadida", "Bouskoura", "Salé", "Safi", "Dakhla", "Ifrane", "Skhirat", "Béni Mellal", "Khouribga", "Laâyoune", "Mohammedia", "Bouznika", "Berkane", "Ouarzazate", "Nador"];
export function eventToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Casablanca", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
function localDate(value: unknown): string {
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
  const key = (title: string) => normalize(title).split(" ").filter((word) => !["en", "concert", "a", "de", "the", "le", "la", "les", "par", "at", "live"].includes(word));
  for (const item of items) {
    const words = key(item.title);
    const existing = result.find((entry) => {
      if (entry.href === item.href) return true;
      if (entry.releaseDate !== item.releaseDate) return false;
      const samePlace = entry.venue && item.venue && normalize(entry.venue) === normalize(item.venue);
      const sameCity = entry.city && item.city && normalize(entry.city) === normalize(item.city);
      if (!samePlace && !sameCity) return false;
      const other = key(entry.title), shared = words.filter((word) => other.includes(word)).length;
      return normalize(entry.title) === normalize(item.title) || (Math.min(words.length, other.length) >= 3 && shared / Math.min(words.length, other.length) >= 0.85);
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
