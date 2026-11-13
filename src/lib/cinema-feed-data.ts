import type { UpcomingItem } from "@/lib/upcoming";

export const CINEMA_SOURCES = [
  { id: "EMS0598", city: "Casablanca", name: "Megarama Casablanca", url: "https://casablanca.megarama.ma/" },
  { id: "EMS1160", city: "Rabat", name: "Megarama Rabat", url: "https://rabat.megarama.ma/" },
  { id: "EMS0757", city: "Marrakech", name: "Megarama Marrakech", url: "https://marrakech.megarama.ma/" },
] as const;
export type CinemaSource = (typeof CINEMA_SOURCES)[number];
export type CinemaMovie = UpcomingItem & { cinemas: string[]; firstSession: string; lastSession: string };
export type CinemaFeed = { movies: CinemaMovie[]; syncedAt: string | null; checkedAt: string; error: string | null; sources: string[] };

export function moroccoMinute(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Casablanca", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  return ["year", "month", "day", "hour", "minute"].map((key) => parts.find((part) => part.type === key)?.value).join("");
}

export function parseCinemaSchedule(payload: unknown, source: CinemaSource, now = new Date()): CinemaMovie[] {
  const events = (payload as { result?: { schedule?: { events?: unknown[] } } })?.result?.schedule?.events;
  if (!Array.isArray(events)) throw new Error("Cinema schedule format changed.");
  const current = moroccoMinute(now);
  const today = current.slice(0, 8);
  return events.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const event = raw as Record<string, unknown>;
    const id = String(event.id ?? "");
    const title = typeof event.title === "string" ? event.title.trim() : "";
    const release = String(event.release_date ?? "");
    const sessions = Array.isArray(event.sessions) ? event.sessions.flatMap((session) => {
      const date = session && typeof session === "object" ? String(session.date ?? "") : "";
      return /^\d{12}$/.test(date) && date >= current ? [date] : [];
    }).sort() : [];
    // Upcoming films in the schedule must not be labelled as currently showing.
    if (!id || !title || !sessions.length || (/^\d{8}$/.test(release) && release > today)) return [];
    let image = "";
    try {
      const poster = new URL(String(event.bill_url ?? ""));
      if (poster.protocol === "https:" && ["images.monnaie-services.com", "images.imscine.com", "movies.monnaie-services.com"].includes(poster.hostname)) image = poster.href.replace(/(\/movie_poster\/)\d+\//, "$1600/");
    } catch { /* Skip entries without valid posters. */ }
    if (!image) return [];
    return [{ id: Number(event.tmdb_id) > 0 ? `tmdb-${event.tmdb_id}` : `megarama-${id}`, title,
      releaseDate: /^\d{8}$/.test(release) ? `${release.slice(0, 4)}-${release.slice(4, 6)}-${release.slice(6, 8)}` : "",
      image, overview: typeof event.synopsis === "string" ? event.synopsis : "",
      href: `${source.url}#showmovie?id=${encodeURIComponent(id)}`, cinemas: [source.city], firstSession: sessions[0], lastSession: sessions[sessions.length - 1] }];
  });
}

export function mergeCinemaMovies(groups: CinemaMovie[][]): CinemaMovie[] {
  const movies = new Map<string, CinemaMovie>();
  for (const movie of groups.flat()) {
    const existing = movies.get(movie.id);
    if (!existing) { movies.set(movie.id, { ...movie, cinemas: [...movie.cinemas] }); continue; }
    existing.cinemas = [...new Set([...existing.cinemas, ...movie.cinemas])];
    existing.firstSession = existing.firstSession < movie.firstSession ? existing.firstSession : movie.firstSession;
    existing.lastSession = existing.lastSession > movie.lastSession ? existing.lastSession : movie.lastSession;
  }
  return [...movies.values()].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || a.title.localeCompare(b.title)).slice(0, 20);
}
