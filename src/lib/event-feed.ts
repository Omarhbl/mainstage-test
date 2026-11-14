import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getEventDiscovery } from "@/lib/event-discovery";
import { EVENT_SOURCES, eventToday, mergeTicketEvents, parseGuichetEvents, parseIticketSnapshot, parseStructuredEvents, parseTicketEvents, type EventFeed, type EventSourceState } from "@/lib/event-feed-data";
const HOURS = 60 * 60 * 1000;
const HEADERS = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36", "Accept-Language": "fr-FR,fr;q=0.9" };
export async function getEventFeed(force = false): Promise<EventFeed> {
  const client = createSupabaseAdminClient();
  const now = new Date(), today = eventToday(now);
  if (!client) return { items: [], sources: [], checkedAt: "", error: "Automatic event listings are temporarily unavailable." };
  const { data, error } = await client.from("site_settings").select("value").eq("key", "morocco_event_feed_v2").maybeSingle();
  if (error) return { items: [], sources: [], checkedAt: "", error: "Could not read automatic event listings." };
  const saved = data?.value as EventFeed | undefined;
  const discovery = await getEventDiscovery();
  let changed = false;
  const sources = await Promise.all(EVENT_SOURCES.map(async (source): Promise<EventSourceState> => {
    const previous = saved?.sources?.find((entry) => entry.id === source.id);
    const valid = previous?.syncedAt && now.getTime() - Date.parse(previous.syncedAt) < 24 * HOURS;
    const cached = { id: source.id, name: source.name, items: valid && Array.isArray(previous?.items) ? previous.items.filter((event) => event.releaseDate >= today) : [], checkedAt: previous?.checkedAt ?? "", syncedAt: previous?.syncedAt ?? null, error: previous?.error ?? null, method: previous?.method };
    const discovered = discovery.feed?.sources.find((entry) => entry.id === source.id);
    const hasNewDiscovery = discovered && !discovered.error && (cached.error || cached.method === "search") && Date.parse(discovered.checkedAt) > Date.parse(cached.syncedAt || "1970-01-01");
    if (!force && !hasNewDiscovery && now.getTime() - Date.parse(cached.checkedAt) < (cached.error ? HOURS : 6 * HOURS)) return cached;
    changed = true;
    try {
      const url = source.id === "iticket" ? "https://raw.githubusercontent.com/Omarhbl/mainstage-test/main/src/data/iticket-events.json" : source.url;
      const response = await fetch(url, { headers: { ...HEADERS, ...(source.id === "ticket" ? { "source-request": "website" } : {}) }, cache: "no-store", signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error("Public catalogue unavailable.");
      if (source.id === "iticket") {
        const snapshot = parseIticketSnapshot(await response.json(), now);
        return { id: source.id, name: source.name, items: snapshot.items, checkedAt: now.toISOString(), syncedAt: snapshot.syncedAt, error: null };
      }
      const items = source.id === "ticket" ? parseTicketEvents(await response.json(), now) : await (async () => {
        const html = await response.text();
        if (html.length > 3_000_000) throw new Error("Catalogue too large.");
        return source.id === "guichet" ? parseGuichetEvents(html, now) : parseStructuredEvents(html, source.id, now);
      })();
      return { id: source.id, name: source.name, items, checkedAt: now.toISOString(), syncedAt: now.toISOString(), error: null };
    } catch {
      const found = discovery.feed?.sources.find((entry) => entry.id === source.id);
      if (found && !found.error) return { id: source.id, name: source.name, items: mergeTicketEvents([...found.items, ...(previous?.method !== "search" ? cached.items : [])]), checkedAt: now.toISOString(), syncedAt: found.checkedAt, error: null, method: "search" };
      return { ...cached, checkedAt: now.toISOString(), error: "Automatic access unavailable. You can still add events from this platform manually below." };
    }
  }));
  const items = mergeTicketEvents(sources.flatMap((source) => source.items));
  const feed: EventFeed = { items, sources, checkedAt: now.toISOString(), error: items.length ? null : "Automatic event listings are temporarily unavailable." };
  if (changed) {
    const { error: saveError } = await client.from("site_settings").upsert({ key: "morocco_event_feed_v2", value: feed, updated_at: now.toISOString() }, { onConflict: "key" });
    if (saveError) return { ...feed, error: "Event listings could not be cached." };
  }
  return feed;
}
