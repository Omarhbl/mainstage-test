type RadioVolumeTarget = Pick<HTMLAudioElement, "volume" | "muted">;

export function setRadioVolume(audio: RadioVolumeTarget, next: number) {
  const volume = Number.isFinite(next) ? Math.min(1, Math.max(0, next)) : 0.8;
  audio.volume = volume;
  audio.muted = volume === 0;
  return volume;
}

export function toggleRadioMute(audio: RadioVolumeTarget, lastAudibleVolume: number) {
  if (audio.muted || audio.volume === 0) {
    if (audio.volume === 0) audio.volume = lastAudibleVolume > 0 ? Math.min(1, lastAudibleVolume) : 0.8;
    audio.muted = false;
  } else {
    audio.muted = true;
  }
  return audio.muted;
}

/** Check every second around a transition; never guess/promote the queued song. */
export function radioPollDelay(remainingSeconds: number | null | undefined) {
  if (remainingSeconds == null || !Number.isFinite(remainingSeconds)) return 5000;
  return Math.min(5000, Math.max(1000, (remainingSeconds - 2) * 1000));
}
