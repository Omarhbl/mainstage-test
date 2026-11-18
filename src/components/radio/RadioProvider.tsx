"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { RADIO_FALLBACK_ART, RADIO_STREAM, type RadioSnapshot } from "@/lib/website-radio";
import { radioPollDelay, setRadioVolume, toggleRadioMute } from "@/lib/radio-playback";
import { RadioBar } from "./RadioPlayer";

type Playback = "idle" | "loading" | "playing" | "error";
type RadioContextValue = {
  snapshot: RadioSnapshot | null; stale: boolean; playback: Playback; volume: number; muted: boolean;
  toggle: () => void; toggleMute: () => void; changeVolume: (volume: number) => void;
};
const RadioContext = createContext<RadioContextValue | null>(null);
export function useRadio() {
  const value = useContext(RadioContext);
  if (!value) throw new Error("RadioProvider missing");
  return value;
}
export default function RadioProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hidden = /^\/(backoffice|backstage)(\/|$)/.test(pathname) || pathname === "/login" || pathname === "/guestlist";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intent = useRef(false);
  const attempt = useRef(0);
  const lastAudibleVolume = useRef(0.8);
  const [snapshot, setSnapshot] = useState<RadioSnapshot | null>(null);
  const [stale, setStale] = useState(false);
  const [playback, setPlayback] = useState<Playback>("idle");
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const stop = useCallback(() => {
    intent.current = false;
    attempt.current += 1;
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.removeAttribute("src"); audio.load(); }
    setPlayback("idle");
  }, []);
  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (intent.current) { stop(); return; }
    intent.current = true;
    const currentAttempt = ++attempt.current;
    setPlayback("loading");
    audio.src = `${RADIO_STREAM}?t=${Date.now()}`;
    void audio.play().catch(() => {
      if (intent.current && attempt.current === currentAttempt) { intent.current = false; setPlayback("error"); }
    });
  }, [stop]);
  const changeVolume = useCallback((next: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = setRadioVolume(audio, next);
    setVolume(value);
    setMuted(audio.muted);
    if (value > 0) lastAudibleVolume.current = value;
    try { localStorage.setItem("mainstage-radio-volume", String(value)); } catch { /* private browsing */ }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setMuted(toggleRadioMute(audio, lastAudibleVolume.current));
    setVolume(audio.volume);
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;
    audio.onvolumechange = () => {
      setVolume(audio.volume);
      setMuted(audio.muted || audio.volume === 0);
      if (audio.volume > 0) lastAudibleVolume.current = audio.volume;
    };
    try {
      const saved = localStorage.getItem("mainstage-radio-volume");
      const value = saved === null ? 0.8 : Number(saved);
      audio.volume = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0.8;
    } catch { audio.volume = 0.8; }
    audio.onplaying = () => { if (intent.current) setPlayback("playing"); };
    audio.onwaiting = () => { if (intent.current) setPlayback("loading"); };
    audio.onerror = () => { if (intent.current) { intent.current = false; setPlayback("error"); } };
    audio.onpause = () => { if (intent.current) { intent.current = false; setPlayback("idle"); } };
    audio.onended = () => { intent.current = false; setPlayback("error"); };
    return () => { intent.current = false; audio.pause(); audio.removeAttribute("src"); audio.load(); audioRef.current = null; };
  }, []);

  useEffect(() => {
    if (playback !== "loading") return;
    const timer = window.setTimeout(() => {
      if (!intent.current) return;
      stop();
      setPlayback("error");
    }, 20000);
    return () => clearTimeout(timer);
  }, [playback, stop]);

  useEffect(() => {
    if (hidden) return;
    let active = true;
    let pending = false;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    async function refresh() {
      if (!active || pending) return;
      clearTimeout(timer);
      if (document.hidden && !intent.current) { timer = setTimeout(refresh, 5000); return; }
      pending = true;
      let delay = 5000;
      try {
        const response = await fetch(`/api/radio/now-playing?t=${Date.now()}`, { cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]) });
        if (!response.ok) throw new Error("Unavailable");
        const data = await response.json() as RadioSnapshot;
        delay = radioPollDelay(data.remainingSeconds);
        if (active) { setSnapshot(data); setStale(false); }
      } catch { if (active) setStale(true); }
      finally {
        pending = false;
        if (active) timer = setTimeout(refresh, delay);
      }
    }
    void refresh();
    const wake = () => { if (!document.hidden) void refresh(); };
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("online", wake);
    return () => { active = false; controller.abort(); clearTimeout(timer); document.removeEventListener("visibilitychange", wake); window.removeEventListener("online", wake); };
  }, [hidden]);

  const nextArtwork = snapshot?.next?.art || RADIO_FALLBACK_ART;
  useEffect(() => {
    // Warm the upcoming cover in the browser cache before it becomes current.
    const cover = new Image();
    cover.src = nextArtwork;
  }, [nextArtwork]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    // Device/lock-screen branding is separate from the website's live track display.
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "Mainstage — On Air",
      artist: "Your soundtrack, around the clock.",
      artwork: [{ src: RADIO_FALLBACK_ART, sizes: "1254x1254", type: "image/png" }],
    });
    navigator.mediaSession.playbackState = playback === "playing" ? "playing" : "paused";
    navigator.mediaSession.setActionHandler("play", () => { if (!intent.current) toggle(); });
    navigator.mediaSession.setActionHandler("pause", stop);
    return () => { navigator.mediaSession.setActionHandler("play", null); navigator.mediaSession.setActionHandler("pause", null); };
  }, [playback, stop, toggle]);

  return <RadioContext.Provider value={{ snapshot, stale, playback, volume, muted, toggle, toggleMute, changeVolume }}>
    {children}
    {!hidden && <RadioBar />}
  </RadioContext.Provider>;
}
