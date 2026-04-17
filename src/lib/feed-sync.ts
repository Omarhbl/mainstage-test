import { promises as fs } from "node:fs";
import path from "node:path";
import {
  FEED_AUTO_REFRESH_INTERVAL_MS,
  FEED_STALE_AFTER_MS,
} from "@/lib/feed-monitor";
import { SPOTIFY_MOROCCO_SYNCED_AT } from "@/lib/spotify";
import { YOUTUBE_MOROCCO_SYNCED_AT } from "@/lib/youtube";

const LOCK_FILE_PATH = path.join("/tmp", "mainstage-feed-refresh.lock");
const LOCK_MAX_AGE_MS = 15 * 60 * 1000;

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

export async function refreshFeedsIfNeeded(options?: {
  force?: boolean;
  service?: "youtube" | "spotify" | "all";
}) {
  const force = options?.force ?? false;
  const service = options?.service ?? "all";
  const shouldCheckYoutube = service === "all" || service === "youtube";
  const shouldCheckSpotify = service === "all" || service === "spotify";
  const shouldRefreshYoutube =
    shouldCheckYoutube && (force || isStale(YOUTUBE_MOROCCO_SYNCED_AT));
  const shouldRefreshSpotify =
    shouldCheckSpotify && (force || isStale(SPOTIFY_MOROCCO_SYNCED_AT));

  if (!shouldRefreshYoutube && !shouldRefreshSpotify) {
    return {
      refreshed: [] as string[],
      skipped: ["youtube", "spotify"],
      autoRefreshIntervalMs: FEED_AUTO_REFRESH_INTERVAL_MS,
      alreadyRunning: false,
      runtimeMode: "vercel-read-only",
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
      runtimeMode: "vercel-read-only",
      note: "Refresh already running.",
    };
  }

  try {
    const refreshed: string[] = [];
    const skipped: string[] = [];

    if (shouldRefreshYoutube) {
      refreshed.push("youtube");
    } else {
      skipped.push("youtube");
    }

    if (shouldRefreshSpotify) {
      refreshed.push("spotify");
    } else {
      skipped.push("spotify");
    }

    return {
      refreshed: [],
      skipped,
      autoRefreshIntervalMs: FEED_AUTO_REFRESH_INTERVAL_MS,
      alreadyRunning: false,
      runtimeMode: "vercel-read-only",
      note:
        "Cron ran, but persistent feed refresh is disabled on Vercel because this project uses static JSON imports and a read-only runtime filesystem.",
      pendingRefreshes: refreshed,
    };
  } finally {
    await releaseRefreshLock();
  }
}
