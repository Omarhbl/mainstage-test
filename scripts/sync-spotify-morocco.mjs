import fs from "node:fs/promises";
import path from "node:path";

const PLAYLIST_ID = "37i9dQZEVXbJU9eQpX8gPT";
const PLAYLIST_URL = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator`;
const KWORB_URL = "https://kworb.net/spotify/country/ma_daily.html";
const OUTPUT_PATH = path.resolve(
  process.cwd(),
  "src/data/spotify-morocco.json"
);
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36";

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status} for ${url}`);
  }

  return response.text();
}

function extractPlaylistEntity(html) {
  const nextDataMatch = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/i
  );

  if (!nextDataMatch) {
    return null;
  }

  try {
    const parsed = JSON.parse(nextDataMatch[1].trim());
    return parsed?.props?.pageProps?.state?.data?.entity ?? null;
  } catch {
    return null;
  }
}

function normalizeTrack(item, index) {
  const uri = item?.uri || "";
  const id = uri.split(":").pop() || "";

  return {
    rank: `#${index + 1}`,
    title: item?.title || `Track ${index + 1}`,
    artist: item?.subtitle || "Unknown Artist",
    image: "",
    uri,
    id,
  };
}

function extractTracks(entity) {
  const trackList = entity?.trackList;

  if (!Array.isArray(trackList) || trackList.length === 0) {
    return [];
  }

  return trackList
    .map(normalizeTrack)
    .filter((track) => track.title && track.artist && track.id);
}

async function enrichTrackImage(track) {
  try {
    const response = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(
        `https://open.spotify.com/track/${track.id}`
      )}`,
      {
        headers: {
          "user-agent": USER_AGENT,
          accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`oEmbed request failed with status ${response.status}`);
    }

    const payload = await response.json();

    if (payload?.thumbnail_url) {
      return {
        ...track,
        image: payload.thumbnail_url,
      };
    }
  } catch (error) {
    console.warn(
      `Could not fetch cover art for ${track.title}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  return track;
}

async function enrichTrackImages(tracks) {
  const enriched = [];

  for (const track of tracks) {
    enriched.push(await enrichTrackImage(track));
  }

  return enriched;
}

function parseNumber(value) {
  return Number(value.replace(/[,+]/g, "").trim()) || 0;
}

function parseKworbChart(html) {
  const rows = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)];
  const chart = new Map();

  for (const rowMatch of rows) {
    const row = rowMatch[1];
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((match) =>
      match[1].replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim()
    );

    const trackLinkMatch = row.match(/\.\.\/track\/([A-Za-z0-9]+)\.html/);

    if (!trackLinkMatch || cells.length < 11) {
      continue;
    }

    const trackId = trackLinkMatch[1];

    chart.set(trackId, {
      position: cells[0],
      movement: cells[1],
      streams: parseNumber(cells[6]),
      streamsDelta: cells[7],
      sevenDay: cells[8],
      totalStreams: cells[10],
    });
  }

  return chart;
}

async function main() {
  const html = await fetchHtml(PLAYLIST_URL);
  const entity = extractPlaylistEntity(html);

  if (!entity) {
    throw new Error("Could not find playlist data in Spotify embed response.");
  }

  const tracks = extractTracks(entity);

  if (tracks.length === 0) {
    throw new Error("Could not extract track list from Spotify embed response.");
  }

  const enrichedTracks = await enrichTrackImages(tracks);
  const kworbHtml = await fetchHtml(KWORB_URL);
  const kworbChart = parseKworbChart(kworbHtml);

  const payload = {
    playlistId: PLAYLIST_ID,
    playlistName: entity?.title || entity?.name || "Top 50 - Morocco",
    market: "MA",
    source: "spotify-embed-scrape",
    scrapedAt: new Date().toISOString(),
    tracks: enrichedTracks.map(({ id, uri, ...track }) => {
      const kworbData = kworbChart.get(id);

      return {
        ...track,
        plays: kworbData?.streams ?? null,
        chartChange: kworbData?.movement ?? "=",
        totalStreams: kworbData?.totalStreams ?? null,
      };
    }),
  };

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(
    `Spotify Morocco sync complete: ${payload.tracks.length} tracks written to ${OUTPUT_PATH}`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
