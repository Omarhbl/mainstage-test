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
    // Ignore missing env file and fall back to existing environment variables.
  }
}

await loadLocalEnv();

const API_KEY = process.env.YOUTUBE_API_KEY;
const REGION = "MA";
const CATEGORY_ID = "10";
const MAX_RESULTS = 12;
const OUTPUT_PATH = path.resolve(
  process.cwd(),
  "src/data/youtube-morocco.json"
);

if (!API_KEY) {
  console.error("Missing YOUTUBE_API_KEY");
  process.exit(1);
}

const API_URL = new URL("https://www.googleapis.com/youtube/v3/videos");
API_URL.searchParams.set("part", "snippet");
API_URL.searchParams.set("chart", "mostPopular");
API_URL.searchParams.set("regionCode", REGION);
API_URL.searchParams.set("videoCategoryId", CATEGORY_ID);
API_URL.searchParams.set("maxResults", String(MAX_RESULTS));
API_URL.searchParams.set("key", API_KEY);

function pickThumbnail(snippet) {
  return (
    snippet?.thumbnails?.maxres?.url ||
    snippet?.thumbnails?.standard?.url ||
    snippet?.thumbnails?.high?.url ||
    snippet?.thumbnails?.medium?.url ||
    snippet?.thumbnails?.default?.url ||
    ""
  );
}

async function main() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`YouTube API request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const items = Array.isArray(payload?.items) ? payload.items : [];

  const normalized = {
    region: REGION,
    categoryId: CATEGORY_ID,
    source: "youtube-data-api",
    syncedAt: new Date().toISOString(),
    videos: items.map((item) => ({
      id: item.id,
      title: item?.snippet?.title || "Untitled video",
      channel: item?.snippet?.channelTitle || "Unknown channel",
      publishedAt: item?.snippet?.publishedAt || "",
      description: item?.snippet?.description || "",
      image: pickThumbnail(item?.snippet),
      url: `https://www.youtube.com/watch?v=${item.id}`,
    })),
  };

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  console.log(
    `YouTube Morocco sync complete: ${normalized.videos.length} videos written to ${OUTPUT_PATH}`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
