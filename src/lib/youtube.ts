import {
  FALLBACK_YOUTUBE_FEED as youtubeData,
  type YouTubeMoroccoFeed,
  type YouTubeVideoEntry,
} from "@/lib/feed-data";

export type { YouTubeMoroccoFeed, YouTubeVideoEntry };

export function formatYouTubeDate(isoDate?: string) {
  if (!isoDate) return "";

  const parsed = new Date(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return `${String(parsed.getDate()).padStart(2, "0")}/${String(
    parsed.getMonth() + 1
  ).padStart(2, "0")}/${parsed.getFullYear()}`;
}

export const YOUTUBE_MOROCCO_VIDEOS = youtubeData.videos;
export const YOUTUBE_MOROCCO_TOP_VIDEOS = youtubeData.videos.slice(0, 4);
export const YOUTUBE_MOROCCO_SYNCED_AT = youtubeData.syncedAt;
