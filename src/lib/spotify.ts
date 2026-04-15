import spotifyMorocco from "@/data/spotify-morocco.json";

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

const spotifyData = spotifyMorocco as SpotifyPlaylistData;

export const SPOTIFY_MOROCCO_PLAYLIST_ID = spotifyData.playlistId;
export const SPOTIFY_MOROCCO_URL = `https://open.spotify.com/playlist/${spotifyData.playlistId}`;
export const SPOTIFY_MOROCCO_TRACKS = spotifyData.tracks;
export const SPOTIFY_TOP_TEN = spotifyData.tracks.slice(0, 10);
export const SPOTIFY_MOROCCO_SYNCED_AT = spotifyData.scrapedAt;
