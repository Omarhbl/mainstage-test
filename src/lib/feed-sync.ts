import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import {
  FEED_AUTO_REFRESH_INTERVAL_MS,
  FEED_STALE_AFTER_MS,
} from "@/lib/feed-monitor";
import { SPOTIFY_MOROCCO_SYNCED_AT } from "@/lib/spotify";
import { YOUTUBE_MOROCCO_SYNCED_AT } from "@/lib/youtube";

const execFileAsync = promisify(execFile);
const PROJECT_ROOT = "/Users/user/Desktop/MAINSTAGE/MEDIASWEBSITE";
const LOCK_FILE_PATH = path.join("/tmp", "mainstage-feed-refresh.lock");
const LOCK_MAX_AGE_MS = 15 * 60 * 1000;

function isStale(syncedAtValue: string) {
  const parsed = new Date(syncedAtValue);

  if (Number.isNaN(parsed.getTime())) {
    return true;
  }

  return Date.now() - parsed.getTime() > FEED_STALE_AFTER_MS;
}

async function runSyncScript(scriptName: "sync:youtube:morocco" | "sync:spotify:morocco") {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

  return execFileAsync(npmCommand, ["run", scriptName], {
    cwd: PROJECT_ROOT,
    env: process.env,
  });
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

export async function refreshFeedsIfNeeded(options?: { force?: boolean }) {
  const force = options?.force ?? false;
  const shouldRefreshYoutube = force || isStale(YOUTUBE_MOROCCO_SYNCED_AT);
  const shouldRefreshSpotify = force || isStale(SPOTIFY_MOROCCO_SYNCED_AT);

  if (!shouldRefreshYoutube && !shouldRefreshSpotify) {
    return {
      refreshed: [] as string[],
      skipped: ["youtube", "spotify"],
      autoRefreshIntervalMs: FEED_AUTO_REFRESH_INTERVAL_MS,
      alreadyRunning: false,
    };
  }

  const lockAcquired = await acquireRefreshLock();

  if (!lockAcquired) {
    return {
      refreshed: [] as string[],
      skipped: [] as string[],
      autoRefreshIntervalMs: FEED_AUTO_REFRESH_INTERVAL_MS,
      alreadyRunning: true,
    };
  }

  const refreshed: string[] = [];
  const skipped: string[] = [];

  try {
    if (shouldRefreshYoutube) {
      await runSyncScript("sync:youtube:morocco");
      refreshed.push("youtube");
    } else {
      skipped.push("youtube");
    }

    if (shouldRefreshSpotify) {
      await runSyncScript("sync:spotify:morocco");
      refreshed.push("spotify");
    } else {
      skipped.push("spotify");
    }

    return {
      refreshed,
      skipped,
      autoRefreshIntervalMs: FEED_AUTO_REFRESH_INTERVAL_MS,
      alreadyRunning: false,
    };
  } finally {
    await releaseRefreshLock();
  }
}

