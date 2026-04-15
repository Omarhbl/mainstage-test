import tmdbUpcoming from "@/data/tmdb-upcoming.json";

export type TmdbUpcomingMovie = {
  id: number;
  title: string;
  releaseDate: string;
  image: string;
  overview?: string;
};

export type TmdbUpcomingFeed = {
  region: string;
  source: string;
  syncedAt: string;
  results: TmdbUpcomingMovie[];
};

const tmdbData = tmdbUpcoming as TmdbUpcomingFeed;

export function formatReleaseDate(value?: string) {
  if (!value) return "";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return `${String(parsed.getDate()).padStart(2, "0")}/${String(
    parsed.getMonth() + 1
  ).padStart(2, "0")}/${parsed.getFullYear()}`;
}

export const TMDB_MOROCCO_UPCOMING = tmdbData.results;
