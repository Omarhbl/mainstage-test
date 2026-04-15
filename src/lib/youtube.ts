import youtubeMorocco from "@/data/youtube-morocco.json";

export type YouTubeVideoEntry = {
  id: string;
  title: string;
  channel: string;
  publishedAt: string;
  description: string;
  image: string;
  url: string;
};

export type YouTubeMoroccoFeed = {
  region: string;
  categoryId: string;
  source: string;
  syncedAt: string;
  videos: YouTubeVideoEntry[];
};

const youtubeData = youtubeMorocco as YouTubeMoroccoFeed;

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
