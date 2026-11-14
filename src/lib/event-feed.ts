import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { EVENT_SOURCES, eventToday, mergeTicketEvents, parseGuichetEvents, parseIticketCatalogue, parseStructuredEvents, parseTicketEvents, type EventFeed, type EventSourceState } from "@/lib/event-feed-data";
const HOURS = 60 * 60 * 1000;
const HEADERS = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36", "Accept-Language": "fr-FR,fr;q=0.9" };
export async function getEventFeed(force = false): Promise<EventFeed> {
  const client = createSupabaseAdminClient();
  const now = new Date(), today = eventToday(now);
  if (!client) return { items: [], sources: [], checkedAt: "", error: "Automatic event listings are temporarily unavailable." };
  const { data, error } = await client.from("site_settings").select("value").eq("key", "morocco_event_feed_v2").maybeSingle();
  if (error) return { items: [], sources: [], checkedAt: "", error: "Could not read automatic event listings." };
  const saved = data?.value as EventFeed | undefined;
  let changed = false;
  const sources = await Promise.all(EVENT_SOURCES.map(async (source): Promise<EventSourceState> => {
    const previous = saved?.sources?.find((entry) => entry.id === source.id);
    const valid = previous?.syncedAt && now.getTime() - Date.parse(previous.syncedAt) < 24 * HOURS;
    const cached = { id: source.id, name: source.name, items: valid && Array.isArray(previous?.items) ? previous.items.filter((event) => event.releaseDate >= today) : [], checkedAt: previous?.checkedAt ?? "", syncedAt: previous?.syncedAt ?? null, error: previous?.error ?? null };
    if (!force && now.getTime() - Date.parse(cached.checkedAt) < (cached.error ? HOURS : 6 * HOURS)) return cached;
    changed = true;
    try {
      const response = await fetch(source.url, { headers: { ...HEADERS, ...(source.id === "ticket" ? { "source-request": "website" } : {}) }, cache: "no-store", signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error("Public catalogue unavailable.");
      const items = source.id === "ticket" ? parseTicketEvents(await response.json(), now) : source.id === "iticket" ? parseIticketCatalogue(await response.json(), now) : await (async () => {
        const html = await response.text();
        if (html.length > 3_000_000) throw new Error("Catalogue too large.");
        return source.id === "guichet" ? parseGuichetEvents(html, now) : parseStructuredEvents(html, source.id, now);
      })();
      return { id: source.id, name: source.name, items, checkedAt: now.toISOString(), syncedAt: now.toISOString(), error: null };
    } catch {
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
