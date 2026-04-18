import {
  FALLBACK_SPOTIFY_FEED as spotifyData,
  type SpotifyChartEntry,
  type SpotifyPlaylistData,
} from "@/lib/feed-data";

export type { SpotifyChartEntry, SpotifyPlaylistData };

export const SPOTIFY_MOROCCO_PLAYLIST_ID = spotifyData.playlistId;
export const SPOTIFY_MOROCCO_URL = `https://open.spotify.com/playlist/${spotifyData.playlistId}`;
export const SPOTIFY_MOROCCO_TRACKS = spotifyData.tracks;
export const SPOTIFY_TOP_TEN = spotifyData.tracks.slice(0, 10);
export const SPOTIFY_MOROCCO_SYNCED_AT = spotifyData.scrapedAt;
