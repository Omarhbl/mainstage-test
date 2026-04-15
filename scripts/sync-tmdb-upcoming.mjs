import fs from "node:fs/promises";
import path from "node:path";

async function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");

  try {
    const raw = await fs.readFile(envPath, "utf8");
    const lines = raw.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const [key, ...rest] = trimmed.split("=");
      const value = rest.join("=").trim().replace(/^['"]|['"]$/g, "");

      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore missing env file.
  }
}

await loadLocalEnv();

const API_KEY = process.env.TMDB_API_KEY;
const LANGUAGE = "en-US";
const MAX_RESULTS = 12;
const MIN_RESULTS = 6;
const OUTPUT_PATH = path.resolve(process.cwd(), "src/data/tmdb-upcoming.json");

if (!API_KEY) {
  console.error("Missing TMDB_API_KEY");
  process.exit(1);
}

function buildUpcomingUrl() {
  const url = new URL("https://api.themoviedb.org/3/movie/upcoming");
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", LANGUAGE);
  url.searchParams.set("page", "1");
  return url;
}

function buildGlobalUpcomingUrl() {
  const url = new URL("https://api.themoviedb.org/3/movie/upcoming");
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", LANGUAGE);
  url.searchParams.set("page", "1");
  return url;
}

function buildDiscoverFallbackUrl({ region } = {}) {
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const formatDate = (value) =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
      value.getDate()
    ).padStart(2, "0")}`;

  const url = new URL("https://api.themoviedb.org/3/discover/movie");
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", LANGUAGE);
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("include_video", "false");
  url.searchParams.set("sort_by", "popularity.desc");
  url.searchParams.set("with_release_type", "2|3");
  url.searchParams.set("vote_count.gte", "25");
  url.searchParams.set("primary_release_date.gte", formatDate(today));
  url.searchParams.set("primary_release_date.lte", formatDate(nextYear));
  url.searchParams.set("page", "1");

  if (region) {
    url.searchParams.set("region", region);
  }

  return url;
}

function pickImage(movie) {
  const imagePath = movie?.poster_path || movie?.backdrop_path || "";
  if (!imagePath) return "";
  return `https://image.tmdb.org/t/p/w780${imagePath}`;
}

async function main() {
  const collectResults = [];
  const seenIds = new Set();
  const today = new Date();

  async function fetchResults(url) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`TMDB API request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const results = Array.isArray(payload?.results) ? payload.results : [];

    for (const movie of results) {
      if (!movie?.id || seenIds.has(movie.id)) continue;
      if (!movie?.release_date) continue;

      const releaseDate = new Date(movie.release_date);
      if (Number.isNaN(releaseDate.getTime()) || releaseDate < today) continue;

      seenIds.add(movie.id);
      collectResults.push(movie);
    }
  }

  await fetchResults(buildUpcomingUrl());

  if (collectResults.length < MIN_RESULTS) {
    await fetchResults(buildDiscoverFallbackUrl());
  }

  const normalized = {
    region: "GLOBAL",
    source: "tmdb-global-upcoming-api+discover-fallback",
    syncedAt: new Date().toISOString(),
    results: collectResults
      .filter((movie) => movie?.title && movie?.release_date)
      .slice(0, MAX_RESULTS)
      .map((movie) => ({
        id: movie.id,
        title: movie.title,
        releaseDate: movie.release_date,
        image: pickImage(movie),
        overview: movie.overview || "",
      })),
  };

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  console.log(
    `TMDB upcoming sync complete: ${normalized.results.length} movies written to ${OUTPUT_PATH}`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
