import spotifyMorocco from "@/data/spotify-morocco.json";
import youtubeMorocco from "@/data/youtube-morocco.json";

export type SpotifyChartEntry = {
  rank: string;
  title: string;
  artist: string;
  image: string;
  plays?: number | null;
  chartChange?: string;
  totalStreams?: string | null;
};

export type SpotifyPlaylistData = {
  playlistId: string;
  playlistName: string;
  market: string;
  source: string;
  scrapedAt: string;
  tracks: SpotifyChartEntry[];
};

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

export type FeedSettings = {
  spotify: SpotifyPlaylistData;
  youtube: YouTubeMoroccoFeed;
};

export const FALLBACK_SPOTIFY_FEED = spotifyMorocco as SpotifyPlaylistData;
export const FALLBACK_YOUTUBE_FEED = youtubeMorocco as YouTubeMoroccoFeed;

export const FALLBACK_FEED_SETTINGS: FeedSettings = {
  spotify: FALLBACK_SPOTIFY_FEED,
  youtube: FALLBACK_YOUTUBE_FEED,
};

function sanitizeSpotifyTrack(
  track: unknown,
  fallback: SpotifyChartEntry,
  index: number
): SpotifyChartEntry {
  if (!track || typeof track !== "object") {
    return {
      ...fallback,
      rank: `#${index + 1}`,
    };
  }

  const value = track as Partial<SpotifyChartEntry>;

  return {
    rank:
      typeof value.rank === "string" && value.rank.trim()
        ? value.rank.trim()
        : `#${index + 1}`,
    title:
      typeof value.title === "string" && value.title.trim()
        ? value.title.trim()
        : fallback.title,
    artist:
      typeof value.artist === "string" && value.artist.trim()
        ? value.artist.trim()
        : fallback.artist,
    image:
      typeof value.image === "string" && value.image.trim()
        ? value.image.trim()
        : fallback.image,
    plays: typeof value.plays === "number" ? value.plays : fallback.plays ?? null,
    chartChange:
      typeof value.chartChange === "string" && value.chartChange.trim()
        ? value.chartChange.trim()
        : fallback.chartChange ?? "=",
    totalStreams:
      typeof value.totalStreams === "string" && value.totalStreams.trim()
        ? value.totalStreams.trim()
        : fallback.totalStreams ?? null,
  };
}

function sanitizeYoutubeVideo(
  video: unknown,
  fallback: YouTubeVideoEntry,
  index: number
): YouTubeVideoEntry {
  if (!video || typeof video !== "object") {
    return {
      ...fallback,
      id: fallback.id || `youtube-${index + 1}`,
    };
  }

  const value = video as Partial<YouTubeVideoEntry>;

  return {
    id:
      typeof value.id === "string" && value.id.trim()
        ? value.id.trim()
        : fallback.id || `youtube-${index + 1}`,
    title:
      typeof value.title === "string" && value.title.trim()
        ? value.title.trim()
        : fallback.title,
    channel:
      typeof value.channel === "string" && value.channel.trim()
        ? value.channel.trim()
        : fallback.channel,
    publishedAt:
      typeof value.publishedAt === "string" && value.publishedAt.trim()
        ? value.publishedAt.trim()
        : fallback.publishedAt,
    description:
      typeof value.description === "string" ? value.description : fallback.description,
    image:
      typeof value.image === "string" && value.image.trim()
        ? value.image.trim()
        : fallback.image,
    url:
      typeof value.url === "string" && value.url.trim()
        ? value.url.trim()
        : fallback.url,
  };
}

export function sanitizeFeedSettings(value: unknown): FeedSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return FALLBACK_FEED_SETTINGS;
  }

  const raw = value as Partial<FeedSettings>;
  const spotify =
    raw.spotify && typeof raw.spotify === "object" && !Array.isArray(raw.spotify)
      ? (raw.spotify as Partial<SpotifyPlaylistData>)
      : {};
  const youtube =
    raw.youtube && typeof raw.youtube === "object" && !Array.isArray(raw.youtube)
      ? (raw.youtube as Partial<YouTubeMoroccoFeed>)
      : {};

  return {
    spotify: {
      playlistId:
        typeof spotify.playlistId === "string" && spotify.playlistId.trim()
          ? spotify.playlistId.trim()
          : FALLBACK_SPOTIFY_FEED.playlistId,
      playlistName:
        typeof spotify.playlistName === "string" && spotify.playlistName.trim()
          ? spotify.playlistName.trim()
          : FALLBACK_SPOTIFY_FEED.playlistName,
      market:
        typeof spotify.market === "string" && spotify.market.trim()
          ? spotify.market.trim()
          : FALLBACK_SPOTIFY_FEED.market,
      source:
        typeof spotify.source === "string" && spotify.source.trim()
          ? spotify.source.trim()
          : FALLBACK_SPOTIFY_FEED.source,
      scrapedAt:
        typeof spotify.scrapedAt === "string" && spotify.scrapedAt.trim()
          ? spotify.scrapedAt.trim()
          : FALLBACK_SPOTIFY_FEED.scrapedAt,
      tracks: Array.isArray(spotify.tracks)
        ? spotify.tracks.map((track, index) =>
            sanitizeSpotifyTrack(
              track,
              FALLBACK_SPOTIFY_FEED.tracks[index] ?? FALLBACK_SPOTIFY_FEED.tracks[0],
              index
            )
          )
        : FALLBACK_SPOTIFY_FEED.tracks,
    },
    youtube: {
      region:
        typeof youtube.region === "string" && youtube.region.trim()
          ? youtube.region.trim()
          : FALLBACK_YOUTUBE_FEED.region,
      categoryId:
        typeof youtube.categoryId === "string" && youtube.categoryId.trim()
          ? youtube.categoryId.trim()
          : FALLBACK_YOUTUBE_FEED.categoryId,
      source:
        typeof youtube.source === "string" && youtube.source.trim()
          ? youtube.source.trim()
          : FALLBACK_YOUTUBE_FEED.source,
      syncedAt:
        typeof youtube.syncedAt === "string" && youtube.syncedAt.trim()
          ? youtube.syncedAt.trim()
          : FALLBACK_YOUTUBE_FEED.syncedAt,
      videos: Array.isArray(youtube.videos)
        ? youtube.videos.map((video, index) =>
            sanitizeYoutubeVideo(
              video,
              FALLBACK_YOUTUBE_FEED.videos[index] ?? FALLBACK_YOUTUBE_FEED.videos[0],
              index
            )
          )
        : FALLBACK_YOUTUBE_FEED.videos,
    },
  };
}
