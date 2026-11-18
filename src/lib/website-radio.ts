export const RADIO_BASE = "https://radio.themainstagent.com";
export const RADIO_FALLBACK_ART = "https://res.cloudinary.com/docbnheap/image/upload/v1794964769/Mainstage__Glossy_Red_Noir_lv7pcg.png";
export const RADIO_STREAM = `${RADIO_BASE}/listen/mainstage/radio.mp3`;
export type RadioSong = { id: string; title: string; artist: string; art: string | null };
export type RadioSnapshot = { online: boolean; song: RadioSong; history: RadioSong[] };
const text = (value: unknown) => typeof value === "string" ? value.replace(/[\u0000-\u001f]/g, "").trim().slice(0, 300) : "";
export function radioArtwork(value: unknown): string | null {
  try {
    const url = new URL(text(value));
    if (url.origin !== RADIO_BASE || /generic_song|default|fallback/i.test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}
function song(value: unknown): RadioSong {
  const row = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return { id: text(row.id), title: text(row.title) || "Mainstage Radio", artist: text(row.artist), art: radioArtwork(row.art) };
}
export function parseRadioSnapshot(value: unknown): RadioSnapshot {
  if (!value || typeof value !== "object" || typeof (value as Record<string, unknown>).is_online !== "boolean") throw new Error("Invalid radio response");
  const data = value as { is_online: boolean; now_playing?: { song?: unknown }; song_history?: { song?: unknown }[] };
  return { online: data.is_online, song: song(data.now_playing?.song), history: (Array.isArray(data.song_history) ? data.song_history : []).slice(0, 8).map(row => song(row?.song)).filter(row => row.title !== "Mainstage Radio") };
}
