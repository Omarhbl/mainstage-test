import type { UpcomingItem } from "@/lib/upcoming";

export const CINEMA_SOURCES = [
  { id: "EMS0598", city: "Casablanca", name: "Megarama Casablanca", url: "https://casablanca.megarama.ma/" },
  { id: "EMS1160", city: "Rabat", name: "Megarama Rabat", url: "https://rabat.megarama.ma/" },
  { id: "EMS0757", city: "Marrakech", name: "Megarama Marrakech", url: "https://marrakech.megarama.ma/" },
] as const;
export type CinemaSource = (typeof CINEMA_SOURCES)[number];
export type CinemaMovie = UpcomingItem & { cinemas: string[]; firstSession: string; lastSession: string };
export type CinemaFeed = { movies: CinemaMovie[]; upcoming?: UpcomingItem[]; syncedAt: string | null; checkedAt: string; error: string | null; sources: string[] };

export function moroccoMinute(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Casablanca", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  return ["year", "month", "day", "hour", "minute"].map((key) => parts.find((part) => part.type === key)?.value).join("");
}

export function parseCinemaSchedule(payload: unknown, source: CinemaSource, now = new Date(), upcoming = false): CinemaMovie[] {
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
    if (!id || !title || !sessions.length || (upcoming ? !/^\d{8}$/.test(release) || release <= today : /^\d{8}$/.test(release) && release > today)) return [];
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
    const titleKey = (title: string) => title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const aliases = movie.title.split("/").map(titleKey).filter(Boolean);
    const existing = movies.get(movie.id) ?? [...movies.values()].find((entry) => entry.title.split("/").map(titleKey).some((alias) => aliases.includes(alias)));
    if (!existing) { movies.set(movie.id, { ...movie, cinemas: [...movie.cinemas] }); continue; }
    existing.cinemas = [...new Set([...existing.cinemas, ...movie.cinemas])];
    existing.firstSession = existing.firstSession < movie.firstSession ? existing.firstSession : movie.firstSession;
    existing.lastSession = existing.lastSession > movie.lastSession ? existing.lastSession : movie.lastSession;
  }
  return [...movies.values()].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || a.title.localeCompare(b.title)).slice(0, 20);
}

export function parsePatheMovies(payload: unknown, now = new Date()): { movies: CinemaMovie[]; upcoming: CinemaMovie[] } {
  const shows = (payload as { shows?: unknown[] })?.shows;
  if (!Array.isArray(shows)) throw new Error("Pathé feed format changed.");
  const today = moroccoMinute(now).slice(0, 8);
  const movies: CinemaMovie[] = [], upcoming: CinemaMovie[] = [];
  for (const raw of shows) {
    if (!raw || typeof raw !== "object") continue;
    const show = raw as Record<string, unknown>;
    const title = typeof show.title === "string" ? show.title.trim() : "";
    const release = (show.releaseAt as Record<string, string> | undefined)?.MA_FR ?? "";
    const image = (show.posterPath as Record<string, string> | undefined)?.lg ?? "";
    if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(release) || !image.startsWith("https://media.pathe.ma/")) continue;
    const future = release.replaceAll("-", "") > today;
    if (!future && (show.isComingSoon || Number(show.next24ShowtimesCount) <= 0)) continue;
    const movie: CinemaMovie = { id: `pathe-${show.slug}`, title, image, releaseDate: release, cinemas: ["Pathé"], firstSession: today + "0000", lastSession: moroccoMinute(new Date(now.getTime() + 24 * 60 * 60 * 1000)), overview: "" };
    (future ? upcoming : movies).push(movie);
  }
  return { movies, upcoming };
}

export function parsePathePage(html: string, now = new Date()) {
  for (const match of html.matchAll(/<script\b[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g)) {
    const state = JSON.parse(match[1]) as Record<string, { u?: string; b?: unknown }>;
    const entry = Object.values(state).find((item) => item?.u === "https://www.pathe.ma/api/shows");
    if (entry) return parsePatheMovies(entry.b, now);
  }
  throw new Error("Pathé listings are unavailable.");
}
