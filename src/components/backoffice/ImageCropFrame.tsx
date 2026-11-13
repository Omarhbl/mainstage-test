"use client";

import { useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
type Position = [number, number];
type Media = { src: string; type: string };
const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

export default function ImageCropFrame({ media, position, onChange, aspect, scale = 1, overlay }: {
  media: Media; position: Position; onChange: (position: Position) => void; aspect: number; scale?: number; overlay?: ReactNode;
}) {
  const dimensions = useRef({ width: 0, height: 0 });
  const drag = useRef<{ x: number; y: number; position: Position; overflowX: number; overflowY: number } | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  function start(event: PointerEvent<HTMLDivElement>) {
    const { width, height } = dimensions.current;
    if (!width || !height) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const coverScale = Math.max(rect.width / width, rect.height / height);
    drag.current = { x: event.clientX, y: event.clientY, position: [...position], overflowX: (width * coverScale - rect.width) * scale, overflowY: (height * coverScale - rect.height) * scale };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state) return;
    onChange([
      state.overflowX > 0.5 ? clamp(state.position[0] - (event.clientX - state.x) / state.overflowX * 100) : state.position[0],
      state.overflowY > 0.5 ? clamp(state.position[1] - (event.clientY - state.y) / state.overflowY * 100) : state.position[1],
    ]);
  }

  const style = { objectPosition: `${position[0]}% ${position[1]}%`, transform: `scale(${scale})` };
  return (
    <div style={{ aspectRatio: aspect }} className="relative w-full touch-none overflow-hidden rounded-lg bg-[#e4ddd5] cursor-grab active:cursor-grabbing"
      onPointerDown={start} onPointerMove={move} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>
      {!media.src || media.type === "none" || media.type === "youtube" ? (
        <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs text-black/55">{media.type === "youtube" ? "YouTube videos use their own player framing." : "Add an image above to preview its crop."}</p>
      ) : failedSrc === media.src ? (
        <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs text-black/55">Image unavailable. Check the media link above.</p>
      ) : media.type === "video" ? (
        <video key={media.src} src={media.src} autoPlay muted loop playsInline style={style} className="pointer-events-none h-full w-full object-cover"
          onLoadedMetadata={(event) => { dimensions.current = { width: event.currentTarget.videoWidth, height: event.currentTarget.videoHeight }; }} onError={() => setFailedSrc(media.src)} />
      ) : (
        <img key={media.src} src={media.src} alt="Live crop preview" draggable={false} style={style} className="pointer-events-none h-full w-full select-none object-cover"
          onLoad={(event) => { dimensions.current = { width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight }; }} onError={() => setFailedSrc(media.src)} />
      )}
      {overlay ? <div className="pointer-events-none absolute inset-0">{overlay}</div> : null}
    </div>
  );
}

