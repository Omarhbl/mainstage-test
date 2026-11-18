import { appRadioMediaSession, type AppRadio } from "@/lib/app-config";
import { RADIO_FALLBACK_ART, type RadioSnapshot, type RadioSong } from "@/lib/website-radio";

function appTrack(track: RadioSong, fallback: string) {
  return { id: track.id, title: track.title, artist: track.artist, artworkUrl: track.art || fallback };
}
/** Native-friendly fields; station branding stays separate from the changing track. */
export function appRadioNowPlaying(snapshot: RadioSnapshot, radio: AppRadio, now = new Date()) {
  const fallback = radio.artworkUrl || RADIO_FALLBACK_ART;
  const metadataAvailable = snapshot.song.title !== "Mainstage Radio";
  return {
    station: "live",
    isOnline: snapshot.online,
    metadataAvailable,
    title: metadataAvailable ? snapshot.song.title : radio.name,
    artist: metadataAvailable ? snapshot.song.artist : radio.subtitle,
    artworkUrl: snapshot.song.art || fallback,
    playingNext: snapshot.next ? appTrack(snapshot.next, fallback) : null,
    recentlyPlayed: snapshot.history.map(track => appTrack(track, fallback)),
    mediaSession: appRadioMediaSession(radio),
    updatedAt: now.toISOString(),
  };
}
