import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { CINEMA_SOURCES, parseCinemaSchedule, mergeCinemaMovies, moroccoMinute, type CinemaFeed } from "@/lib/cinema-feed-data";

const FRESH_FOR = 6 * 60 * 60 * 1000;
const RETRY_AFTER = 15 * 60 * 1000;
const STALE_FOR = 24 * 60 * 60 * 1000;

export async function getCinemaFeed(force = false): Promise<CinemaFeed> {
  const client = createSupabaseAdminClient();
  const empty: CinemaFeed = { movies: [], syncedAt: null, checkedAt: "", error: null, sources: [] };
  if (!client) return { ...empty, error: "Cinema listings are temporarily unavailable." };
  const { data, error } = await client.from("site_settings").select("value").eq("key", "cinema_live_feed").maybeSingle();
  if (error) return { ...empty, error: "Could not read the cinema feed." };
  const saved = data?.value as CinemaFeed | undefined;
  const now = new Date();
  const current = moroccoMinute(now);
  const validCache = saved?.syncedAt && Number.isFinite(Date.parse(saved.syncedAt)) && now.getTime() - Date.parse(saved.syncedAt) < STALE_FOR;
  const cached: CinemaFeed = { ...empty, ...(saved ?? {}), movies: validCache && Array.isArray(saved?.movies) ? saved.movies.filter((movie) => movie && movie.lastSession >= current) : [] };
  const interval = saved?.error ? RETRY_AFTER : FRESH_FOR;
  if (!force && cached.checkedAt && now.getTime() - Date.parse(cached.checkedAt) < interval) return cached;

  const results = await Promise.allSettled(CINEMA_SOURCES.map(async (source) => {
    const response = await fetch("https://ws.ticketingcine.com/site", { method: "POST", headers: { "Content-Type": "application/json", Referer: source.url }, body: JSON.stringify({ jsonrpc: "2.0", method: "get_prog", params: { site_id: source.id } }), cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("Cinema feed unavailable.");
    return parseCinemaSchedule(await response.json(), source, now);
  }));
  const groups = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
  const successful = CINEMA_SOURCES.filter((_, index) => results[index].status === "fulfilled").map((source) => source.city);
  const next: CinemaFeed = groups.length ? { movies: mergeCinemaMovies(groups), syncedAt: now.toISOString(), checkedAt: now.toISOString(), sources: successful, error: groups.length < CINEMA_SOURCES.length ? "Some cinema sources are temporarily unavailable. Showing confirmed listings from the available cinemas." : null }
    : { ...cached, checkedAt: now.toISOString(), error: "Could not refresh cinema listings. Only previously confirmed, unexpired screenings are shown." };
  const { error: saveError } = await client.from("site_settings").upsert({ key: "cinema_live_feed", value: next, updated_at: now.toISOString() }, { onConflict: "key" });
  return saveError ? { ...next, error: "Cinema listings could not be cached." } : next;
}
