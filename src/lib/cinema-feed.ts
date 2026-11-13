import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { CINEMA_SOURCES, parseCinemaSchedule, mergeCinemaMovies, moroccoMinute, parsePatheMovies, parsePathePage, parseColiseePage, parseCinerjiMovies, type CinemaFeed } from "@/lib/cinema-feed-data";

const FRESH_FOR = 6 * 60 * 60 * 1000;
const RETRY_AFTER = 15 * 60 * 1000;
const STALE_FOR = 24 * 60 * 60 * 1000;

export async function getCinemaFeed(force = false): Promise<CinemaFeed> {
  const client = createSupabaseAdminClient();
  const empty: CinemaFeed = { movies: [], upcoming: [], syncedAt: null, checkedAt: "", error: null, sources: [] };
  if (!client) return { ...empty, error: "Cinema listings are temporarily unavailable." };
  const { data, error } = await client.from("site_settings").select("value").eq("key", "cinema_live_feed_v5").maybeSingle();
  if (error) return { ...empty, error: "Could not read the cinema feed." };
  const saved = data?.value as CinemaFeed | undefined;
  const now = new Date();
  const current = moroccoMinute(now);
  const validCache = saved?.syncedAt && Number.isFinite(Date.parse(saved.syncedAt)) && now.getTime() - Date.parse(saved.syncedAt) < STALE_FOR;
  const cached: CinemaFeed = { ...empty, ...(saved ?? {}), upcoming: validCache && Array.isArray(saved?.upcoming) ? saved.upcoming.filter((movie) => movie.releaseDate.replaceAll("-", "") > current.slice(0, 8)) : [], movies: validCache && Array.isArray(saved?.movies) ? saved.movies.filter((movie) => movie && movie.lastSession >= current) : [] };
  const interval = saved?.error ? RETRY_AFTER : FRESH_FOR;
  if (!force && cached.checkedAt && now.getTime() - Date.parse(cached.checkedAt) < interval) return cached;

  const results = await Promise.allSettled(CINEMA_SOURCES.map(async (source) => {
    const response = await fetch("https://ws.ticketingcine.com/site", { method: "POST", headers: { "Content-Type": "application/json", Referer: source.url }, body: JSON.stringify({ jsonrpc: "2.0", method: "get_prog", params: { site_id: source.id } }), cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("Cinema feed unavailable.");
    const payload = await response.json();
    return { movies: parseCinemaSchedule(payload, source, now), upcoming: parseCinemaSchedule(payload, source, now, true) };
  }).concat([ (async () => {
    const headers = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36", "Accept-Language": "fr-FR,fr;q=0.9" };
    try {
      const response = await fetch("https://www.pathe.ma/api/shows", { headers: { ...headers, Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error("Pathé unavailable.");
      return parsePatheMovies(await response.json(), now);
    } catch {
      const response = await fetch("https://www.pathe.ma/fr", { headers: { ...headers, Accept: "text/html" }, cache: "no-store", signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error("Pathé unavailable.");
      return parsePathePage(await response.text(), now);
    }
  })(), (async () => {
    const pages = await Promise.all(["affiche", "prochainement"].map(async (path) => {
      const response = await fetch(`https://www.lecolisee.ma/${path}/`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error("Colisée unavailable.");
      return response.text();
    }));
    return { movies: parseColiseePage(pages[0], false, now), upcoming: parseColiseePage(pages[1], true, now) };
  })(), (async () => {
    // Public cinema identifier embedded in Cinerji's logged-out homepage, not a user credential.
    const catalogueId = "845d7465-d169-4439-9e97-cd38326d2ef7";
    const [media, shows] = await Promise.all(["media", "shows"].map(async (path) => {
      const response = await fetch(`https://cinerji.cineoffice.fr/vad/${path}?allCinemas=true&api_token=${catalogueId}`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error("Cinerji unavailable.");
      return response.json();
    }));
    return parseCinerjiMovies(media, shows, now);
  })() ]));
  const groups = results.flatMap((result) => result.status === "fulfilled" ? [result.value.movies] : []);
  const successful = [...CINEMA_SOURCES.map((source) => source.city), "Pathé", "Colisée", "Cinerji"].filter((_, index) => results[index].status === "fulfilled");
  const upcoming = mergeCinemaMovies(results.flatMap((result) => result.status === "fulfilled" ? [result.value.upcoming] : [])).sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
  const next: CinemaFeed = groups.length ? { movies: mergeCinemaMovies(groups), upcoming, syncedAt: now.toISOString(), checkedAt: now.toISOString(), sources: successful, error: groups.length < CINEMA_SOURCES.length + 3 ? "Some cinema sources are temporarily unavailable. Showing confirmed listings from the available cinemas." : null }
    : { ...cached, checkedAt: now.toISOString(), error: "Could not refresh cinema listings. Only previously confirmed, unexpired screenings are shown." };
  const { error: saveError } = await client.from("site_settings").upsert({ key: "cinema_live_feed_v5", value: next, updated_at: now.toISOString() }, { onConflict: "key" });
  return saveError ? { ...next, error: "Cinema listings could not be cached." } : next;
}
