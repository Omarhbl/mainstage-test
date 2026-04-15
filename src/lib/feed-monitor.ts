import { SPOTIFY_MOROCCO_SYNCED_AT, SPOTIFY_MOROCCO_TRACKS } from "@/lib/spotify";
import { YOUTUBE_MOROCCO_SYNCED_AT, YOUTUBE_MOROCCO_VIDEOS } from "@/lib/youtube";

export const FEED_AUTO_REFRESH_INTERVAL_MS = 60 * 60 * 1000;
export const FEED_STALE_AFTER_MS = 65 * 60 * 1000;

export type FeedHealth = {
  value: "OK" | "Issue";
  hint: string;
  syncedAtLabel: string;
  nextRefreshLabel: string;
  isStale: boolean;
  itemCount: number;
};

export function formatFeedTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function getFeedHealth(
  syncedAtValue: string,
  itemCount: number,
  label: string
): FeedHealth {
  if (!itemCount) {
    return {
      value: "Issue",
      hint: `${label} feed is empty. Please report this to the admin.`,
      syncedAtLabel: "Not available",
      nextRefreshLabel: "Waiting for first successful sync",
      isStale: true,
      itemCount,
    };
  }

  const syncedAt = new Date(syncedAtValue);

  if (Number.isNaN(syncedAt.getTime())) {
    return {
      value: "Issue",
      hint: `${label} sync date is invalid. Please report this to the admin.`,
      syncedAtLabel: "Invalid sync date",
      nextRefreshLabel: "Unable to calculate next refresh",
      isStale: true,
      itemCount,
    };
  }

  const now = Date.now();
  const syncedAtTime = syncedAt.getTime();
  const hoursSinceSync = (now - syncedAtTime) / (1000 * 60 * 60);
  const nextRefresh = new Date(syncedAtTime + FEED_AUTO_REFRESH_INTERVAL_MS);
  const isStale = now - syncedAtTime > FEED_STALE_AFTER_MS;

  if (hoursSinceSync > FEED_STALE_AFTER_MS / (1000 * 60 * 60)) {
    return {
      value: "Issue",
      hint: `${label} is stale since ${formatFeedTime(syncedAt)}. Please report this to the admin.`,
      syncedAtLabel: formatFeedTime(syncedAt),
      nextRefreshLabel: formatFeedTime(nextRefresh),
      isStale,
      itemCount,
    };
  }

  return {
    value: "OK",
    hint: `${label} is healthy. Last refresh: ${formatFeedTime(syncedAt)}.`,
    syncedAtLabel: formatFeedTime(syncedAt),
    nextRefreshLabel: formatFeedTime(nextRefresh),
    isStale,
    itemCount,
  };
}

export function getSpotifyFeedHealth() {
  return getFeedHealth(
    SPOTIFY_MOROCCO_SYNCED_AT,
    SPOTIFY_MOROCCO_TRACKS.length,
    "Spotify"
  );
}

export function getYoutubeFeedHealth() {
  return getFeedHealth(
    YOUTUBE_MOROCCO_SYNCED_AT,
    YOUTUBE_MOROCCO_VIDEOS.length,
    "YouTube"
  );
}

