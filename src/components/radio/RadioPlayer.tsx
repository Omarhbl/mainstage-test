"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, LoaderCircle, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useRadio } from "./RadioProvider";
import { RADIO_FALLBACK_ART, type RadioSong } from "@/lib/website-radio";
import styles from "./radio.module.css";

export function RadioArtwork({ song, large = false }: { song?: RadioSong; large?: boolean }) {
  const [failed, setFailed] = useState<string | null>(null);
  const art = song?.art && failed !== song.art ? song.art : RADIO_FALLBACK_ART;
  // Remote covers come from the station's allowlisted HTTPS origin; retain the full cover.
  // eslint-disable-next-line @next/next/no-img-element
  return <img key={art} className={`${styles.art} ${large ? styles.largeArt : ""}`} src={art} alt={art === RADIO_FALLBACK_ART ? "Mainstage Radio" : `Artwork for ${song?.title}`} width={large ? 500 : 64} height={large ? 500 : 64} onError={() => { if (song?.art && art !== RADIO_FALLBACK_ART) setFailed(song.art); }} />;
}
function Status() {
  const { snapshot, playback, stale } = useRadio();
  const label = playback === "error" ? "Radio offline · retry" : playback === "loading" ? "Connecting" : playback === "playing" ? "Live" : snapshot?.online === false && !stale ? "Radio offline" : snapshot?.online || stale ? "Live" : "Connecting";
  const live = playback === "playing" || (!!snapshot?.online && !stale && playback !== "error");
  return <span className={styles.status} role="status"><i className={live ? styles.liveDot : styles.dimDot} />{label}</span>;
}
function PlayButton({ big = false }: { big?: boolean }) {
  const { playback, toggle, snapshot, stale } = useRadio();
  const active = playback === "playing" || playback === "loading";
  const offline = snapshot?.online === false && !stale && !active;
  return <button type="button" className={`${styles.play} ${big ? styles.bigPlay : ""}`} onClick={toggle} disabled={offline} aria-label={active ? "Pause Mainstage Radio" : playback === "error" ? "Retry Mainstage Radio" : "Play Mainstage Radio"}>
    {playback === "loading" ? <LoaderCircle className={styles.spin} size={25} aria-hidden /> : active ? <Pause size={25} fill="currentColor" aria-hidden /> : <Play size={25} fill="currentColor" aria-hidden />}
  </button>;
}
function Volume() {
  const { volume, muted, toggleMute, changeVolume } = useRadio();
  return <div className={styles.volume}>
    <button type="button" className={styles.mute} onClick={toggleMute} aria-label={muted ? "Unmute radio" : "Mute radio"} aria-pressed={muted} title={muted ? "Unmute" : "Mute"}>
      {muted ? <VolumeX size={22} aria-hidden /> : <Volume2 size={22} aria-hidden />}
    </button>
    <input type="range" min="0" max="1" step="0.01" value={muted ? 0 : volume} aria-label="Radio volume" onChange={event => changeVolume(Number(event.target.value))} />
  </div>;
}
export function RadioBar() {
  const { snapshot, playback } = useRadio();
  const song = snapshot?.song;
  return <><div className={styles.spacer} aria-hidden /><aside className={styles.bar} aria-label="Mainstage Radio player">
    <div className={styles.barInner}>
      <Link href="/radio" className={styles.trackLink} aria-label="Open Mainstage Radio and recently played tracks">
        <RadioArtwork song={song} />
        <div className={styles.track}><span className={styles.mobileStatus}><Status /></span><strong>{song?.title && song.title !== "Mainstage Radio" ? song.title : "On Air"}</strong><span>{song?.artist || "Your soundtrack, around the clock."}</span></div>
      </Link>
      <div className={styles.barStatus}><Status /></div>
      <div className={`${styles.wave} ${playback === "playing" ? styles.wavePlaying : ""}`} aria-hidden>{[12,24,17,32,20,13,27,16,23].map((height,index) => <i key={index} style={{ height, animationDelay: `${index * 100}ms` }} />)}</div>
      <PlayButton />
      <div className={styles.barVolume}><Volume /></div>
      <Link href="/radio" className={styles.expand} aria-label="Expand radio player"><ArrowUpRight size={24} /></Link>
    </div>
  </aside></>;
}
export function RadioPagePlayer() {
  const { snapshot } = useRadio();
  const song = snapshot?.song;
  return <div className={styles.page}>
    <div className={styles.pageIntro}><h1>On Air<span>.</span></h1><p>Your soundtrack, around the clock.</p></div>
    <section className={styles.hero} aria-label="Listen live">
      <div className={styles.coverWrap}><RadioArtwork song={song} large /></div>
      <div className={styles.heroInfo}><Status /><p className={styles.nowLabel}>NOW ON MAINSTAGE</p><h2>{song?.title && song.title !== "Mainstage Radio" ? song.title : "On Air"}</h2><p className={styles.artist}>{song?.artist || "Your soundtrack, around the clock."}</p><div className={styles.heroControls}><PlayButton big /><Volume /></div>
        {snapshot?.next && <section className={styles.nextTrack} aria-label="Playing next">
          <h3>Playing next</h3>
          <div className={styles.nextTrackInfo}><RadioArtwork song={snapshot.next} /><div><strong>{snapshot.next.title}</strong>{snapshot.next.artist && <p>{snapshot.next.artist}</p>}</div></div>
        </section>}
      </div>
    </section>
    <section className={styles.history}><div className={styles.historyHeading}><h2>Recently played</h2><span>The sounds you just missed.</span></div>
      {snapshot?.history.length ? <ol>{snapshot.history.map((track,index) => <li key={`${track.id}-${index}`}><span className={styles.number}>{String(index + 1).padStart(2,"0")}</span><RadioArtwork song={track} /><div><strong>{track.title}</strong><p>{track.artist || "Mainstage Radio"}</p></div></li>)}</ol> : <p className={styles.empty}>Recently played tracks will appear when the station shares its listening history.</p>}
    </section>
  </div>;
}
