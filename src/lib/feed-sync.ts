import { promises as fs } from "node:fs";
import path from "node:path";
import {
  FEED_AUTO_REFRESH_INTERVAL_MS,
  FEED_STALE_AFTER_MS,
} from "@/lib/feed-monitor";
import type {
  FeedSettings,
  SpotifyChartEntry,
  SpotifyPlaylistData,
  YouTubeMoroccoFeed,
} from "@/lib/feed-data";
import {
  FALLBACK_FEED_SETTINGS,
  sanitizeFeedSettings,
} from "@/lib/feed-data";
import {
  createSupabaseAdminClient,
  getFeedSettings,
} from "@/lib/supabase/server";

const LOCK_FILE_PATH = path.join("/tmp", "mainstage-feed-refresh.lock");
const LOCK_MAX_AGE_MS = 15 * 60 * 1000;
const SPOTIFY_PLAYLIST_ID = "37i9dQZEVXbJU9eQpX8gPT";
const SPOTIFY_PLAYLIST_URL = `https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLIST_ID}?utm_source=generator`;
const SPOTIFY_KWORB_URL = "https://kworb.net/spotify/country/ma_daily.html";
const YOUTUBE_REGION = "MA";
const YOUTUBE_CATEGORY_ID = "10";
const YOUTUBE_MAX_RESULTS = 12;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36";

function isStale(syncedAtValue: string) {
  const parsed = new Date(syncedAtValue);

  if (Number.isNaN(parsed.getTime())) {
    return true;
  }

  return Date.now() - parsed.getTime() > FEED_STALE_AFTER_MS;
}

async function acquireRefreshLock() {
  try {
    const existing = await fs.readFile(LOCK_FILE_PATH, "utf8").catch(() => "");

    if (existing) {
      const existingTime = Number(existing.trim());

      if (
        Number.isFinite(existingTime) &&
        Date.now() - existingTime < LOCK_MAX_AGE_MS
      ) {
        return false;
      }
    }

    await fs.writeFile(LOCK_FILE_PATH, String(Date.now()), "utf8");
    return true;
  } catch {
    return false;
  }
}

async function releaseRefreshLock() {
  await fs.unlink(LOCK_FILE_PATH).catch(() => {});
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status} for ${url}`);
  }

  return response.text();
}

function extractPlaylistEntity(html: string) {
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

function normalizeTrack(item: Record<string, unknown>, index: number) {
  const uri = typeof item.uri === "string" ? item.uri : "";
  const id = uri.split(":").pop() || "";

  return {
    rank: `#${index + 1}`,
    title:
      typeof item.title === "string" && item.title.trim()
        ? item.title
        : `Track ${index + 1}`,
    artist:
      typeof item.subtitle === "string" && item.subtitle.trim()
        ? item.subtitle
        : "Unknown Artist",
    image: "",
    uri,
    id,
  };
}

function extractTracks(entity: Record<string, unknown>) {
  const trackList = entity.trackList;

  if (!Array.isArray(trackList) || trackList.length === 0) {
    return [];
  }

  return trackList
    .map((item, index) =>
      normalizeTrack(
        item && typeof item === "object" ? (item as Record<string, unknown>) : {},
        index
      )
    )
    .filter((track) => track.title && track.artist && track.id);
}

async function enrichTrackImage(track: {
  rank: string;
  title: string;
  artist: string;
  image: string;
  uri: string;
  id: string;
}) {
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
        cache: "no-store",
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
  } catch {
    // Keep the track even if the image lookup fails.
  }

  return track;
}

async function enrichTrackImages(
  tracks: Array<{
    rank: string;
    title: string;
    artist: string;
    image: string;
    uri: string;
    id: string;
  }>
) {
  const enriched = [];

  for (const track of tracks) {
    enriched.push(await enrichTrackImage(track));
  }

  return enriched;
}

function parseNumber(value: string) {
  return Number(value.replace(/[,+]/g, "").trim()) || 0;
}

function parseKworbChart(html: string) {
  const rows = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)];
  const chart = new Map<
    string,
    {
      position: string;
      movement: string;
      streams: number;
      streamsDelta: string;
      sevenDay: string;
      totalStreams: string;
    }
  >();

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

async function fetchSpotifyFeed(): Promise<SpotifyPlaylistData> {
  const html = await fetchHtml(SPOTIFY_PLAYLIST_URL);
  const entity = extractPlaylistEntity(html);

  if (!entity) {
    throw new Error("Could not find playlist data in Spotify embed response.");
  }

  const tracks = extractTracks(entity);

  if (tracks.length === 0) {
    throw new Error("Could not extract track list from Spotify embed response.");
  }

  const enrichedTracks = await enrichTrackImages(tracks);
  const kworbHtml = await fetchHtml(SPOTIFY_KWORB_URL);
  const kworbChart = parseKworbChart(kworbHtml);

  return {
    playlistId: SPOTIFY_PLAYLIST_ID,
    playlistName: entity?.title || entity?.name || "Top 50 - Morocco",
    market: "MA",
    source: "spotify-embed-scrape",
    scrapedAt: new Date().toISOString(),
    tracks: enrichedTracks.map(({ id, ...track }): SpotifyChartEntry => {
      const kworbData = kworbChart.get(id);

      return {
        ...track,
        plays: kworbData?.streams ?? null,
        chartChange: kworbData?.movement ?? "=",
        totalStreams: kworbData?.totalStreams ?? null,
      };
    }),
  };
}

function pickThumbnail(snippet: Record<string, unknown> | undefined) {
  const thumbnails =
    snippet?.thumbnails && typeof snippet.thumbnails === "object"
      ? (snippet.thumbnails as Record<string, unknown>)
      : undefined;

  const maxres =
    thumbnails?.maxres && typeof thumbnails.maxres === "object"
      ? (thumbnails.maxres as Record<string, unknown>)
      : undefined;
  const standard =
    thumbnails?.standard && typeof thumbnails.standard === "object"
      ? (thumbnails.standard as Record<string, unknown>)
      : undefined;
  const high =
    thumbnails?.high && typeof thumbnails.high === "object"
      ? (thumbnails.high as Record<string, unknown>)
      : undefined;
  const medium =
    thumbnails?.medium && typeof thumbnails.medium === "object"
      ? (thumbnails.medium as Record<string, unknown>)
      : undefined;
  const fallback =
    thumbnails?.default && typeof thumbnails.default === "object"
      ? (thumbnails.default as Record<string, unknown>)
      : undefined;

  return (
    (typeof maxres?.url === "string" ? maxres.url : "") ||
    (typeof standard?.url === "string" ? standard.url : "") ||
    (typeof high?.url === "string" ? high.url : "") ||
    (typeof medium?.url === "string" ? medium.url : "") ||
    (typeof fallback?.url === "string" ? fallback.url : "") ||
    ""
  );
}

async function fetchYoutubeFeed(): Promise<YouTubeMoroccoFeed> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing YOUTUBE_API_KEY in production environment.");
  }

  const apiUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  apiUrl.searchParams.set("part", "snippet");
  apiUrl.searchParams.set("chart", "mostPopular");
  apiUrl.searchParams.set("regionCode", YOUTUBE_REGION);
  apiUrl.searchParams.set("videoCategoryId", YOUTUBE_CATEGORY_ID);
  apiUrl.searchParams.set("maxResults", String(YOUTUBE_MAX_RESULTS));
  apiUrl.searchParams.set("key", apiKey);

  const response = await fetch(apiUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`YouTube API request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const items = Array.isArray(payload?.items) ? payload.items : [];

  return {
    region: YOUTUBE_REGION,
    categoryId: YOUTUBE_CATEGORY_ID,
    source: "youtube-data-api",
    syncedAt: new Date().toISOString(),
    videos: items.map((item: unknown) => {
      const record =
        item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      const snippet =
        record.snippet && typeof record.snippet === "object"
          ? (record.snippet as Record<string, unknown>)
          : undefined;
      const id = typeof record.id === "string" ? record.id : "";

      return {
        id,
        title:
          typeof snippet?.title === "string" && snippet.title.trim()
            ? snippet.title
            : "Untitled video",
        channel:
          typeof snippet?.channelTitle === "string" && snippet.channelTitle.trim()
            ? snippet.channelTitle
            : "Unknown channel",
        publishedAt:
          typeof snippet?.publishedAt === "string" ? snippet.publishedAt : "",
        description:
          typeof snippet?.description === "string" ? snippet.description : "",
        image: pickThumbnail(snippet),
        url: `https://www.youtube.com/watch?v=${id}`,
      };
    }),
  };
}

async function persistFeedSettings(settings: FeedSettings) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    throw new Error("Missing Supabase service role configuration.");
  }

  const payload = {
    key: "feed_settings",
    value: settings,
    updated_at: new Date().toISOString(),
  };

  const { data: existing, error: loadError } = await adminClient
    .from("site_settings")
    .select("key")
    .eq("key", "feed_settings")
    .maybeSingle();

  if (loadError) {
    throw new Error(loadError.message);
  }

  const { error } = existing
    ? await adminClient
        .from("site_settings")
        .update({
          value: payload.value,
          updated_at: payload.updated_at,
        })
        .eq("key", payload.key)
    : await adminClient.from("site_settings").insert(payload);

  if (error) {
    throw new Error(error.message);
  }
}

export async function refreshFeedsIfNeeded(options?: {
  force?: boolean;
  service?: "youtube" | "spotify" | "all";
}) {
  const currentSettings = sanitizeFeedSettings(await getFeedSettings());
  const force = options?.force ?? false;
  const service = options?.service ?? "all";
  const shouldCheckYoutube = service === "all" || service === "youtube";
  const shouldCheckSpotify = service === "all" || service === "spotify";
  const shouldRefreshYoutube =
    shouldCheckYoutube && (force || isStale(currentSettings.youtube.syncedAt));
  const shouldRefreshSpotify =
    shouldCheckSpotify && (force || isStale(currentSettings.spotify.scrapedAt));

  if (!shouldRefreshYoutube && !shouldRefreshSpotify) {
    return {
      refreshed: [] as string[],
      skipped: ["youtube", "spotify"],
      autoRefreshIntervalMs: FEED_AUTO_REFRESH_INTERVAL_MS,
      alreadyRunning: false,
      runtimeMode: "supabase-persisted",
      note: "No refresh needed.",
    };
  }

  const lockAcquired = await acquireRefreshLock();

  if (!lockAcquired) {
    return {
      refreshed: [] as string[],
      skipped: [] as string[],
      autoRefreshIntervalMs: FEED_AUTO_REFRESH_INTERVAL_MS,
      alreadyRunning: true,
      runtimeMode: "supabase-persisted",
      note: "Refresh already running.",
    };
  }

  try {
    const nextSettings: FeedSettings = {
      spotify: currentSettings.spotify ?? FALLBACK_FEED_SETTINGS.spotify,
      youtube: currentSettings.youtube ?? FALLBACK_FEED_SETTINGS.youtube,
    };

    const refreshed: string[] = [];
    const skipped: string[] = [];

    if (shouldRefreshYoutube) {
      nextSettings.youtube = await fetchYoutubeFeed();
      refreshed.push("youtube");
    } else {
      skipped.push("youtube");
    }

    if (shouldRefreshSpotify) {
      nextSettings.spotify = await fetchSpotifyFeed();
      refreshed.push("spotify");
    } else {
      skipped.push("spotify");
    }

    await persistFeedSettings(nextSettings);

    return {
      refreshed,
      skipped,
      autoRefreshIntervalMs: FEED_AUTO_REFRESH_INTERVAL_MS,
      alreadyRunning: false,
      runtimeMode: "supabase-persisted",
      note: "Live feed cache updated in Supabase.",
    };
  } finally {
    await releaseRefreshLock();
  }
}
