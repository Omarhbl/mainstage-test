"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PointerEvent } from "react";

type Placement = "cover" | "homepage" | "hero" | "bottom";
type Position = [number, number];
type Media = { src: string; type: string };
const PLACEMENTS: { key: Placement; label: string; prefix: string }[] = [
  { key: "cover", label: "Cover", prefix: "image_position" },
  { key: "hero", label: "Article hero", prefix: "hero_image_position" },
  { key: "homepage", label: "Homepage", prefix: "homepage_image_position" },
  { key: "bottom", label: "Bottom image", prefix: "bottom_image_position" },
];
const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

function CropFrame({ media, position, onChange, aspect }: {
  media: Media; position: Position; onChange: (position: Position) => void; aspect: number;
}) {
  const dimensions = useRef({ width: 0, height: 0 });
  const drag = useRef<{ x: number; y: number; position: Position; overflowX: number; overflowY: number } | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  function start(event: PointerEvent<HTMLDivElement>) {
    const { width, height } = dimensions.current;
    if (!width || !height) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const scale = Math.max(rect.width / width, rect.height / height);
    drag.current = { x: event.clientX, y: event.clientY, position: [...position], overflowX: width * scale - rect.width, overflowY: height * scale - rect.height };
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

  const style = { objectPosition: `${position[0]}% ${position[1]}%` };
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
    </div>
  );
}

export default function ArticleImageFraming({ initial }: { initial: Record<Placement, Position> }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState(initial);
  const [active, setActive] = useState<Placement>("hero");
  const [mobile, setMobile] = useState(false);
  const [media, setMedia] = useState<Record<Placement, Media>>({ cover: { src: "", type: "image" }, homepage: { src: "", type: "image" }, hero: { src: "", type: "image" }, bottom: { src: "", type: "none" } });
  const id = useId();

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;
    const uploads = new Map<string, { file: File; url: string }>();
    function update() {
      const data = new FormData(form!);
      const value = (key: string) => String(data.get(key) ?? "").trim();
      const source = (key: string, fileKey: string) => {
        const file = data.get(fileKey);
        const existing = uploads.get(fileKey);
        if (file instanceof File && file.size > 0) {
          if (existing?.file === file) return existing.url;
          if (existing) URL.revokeObjectURL(existing.url);
          const url = URL.createObjectURL(file);
          uploads.set(fileKey, { file, url });
          return url;
        }
        if (existing) { URL.revokeObjectURL(existing.url); uploads.delete(fileKey); }
        return value(key);
      };
      const cover = { src: source("image", "image_file"), type: "image" };
      setMedia({ cover, homepage: cover,
        hero: { src: source("hero_media_src", "hero_media_file") || cover.src, type: value("hero_media_type") || "image" },
        bottom: { src: source("bottom_media_src", "bottom_media_file"), type: value("bottom_media_type") || "none" },
      });
    }
    function onChange(event: Event) {
      const name = (event.target as HTMLInputElement).name;
      if (["image", "image_file", "hero_media_src", "hero_media_file", "hero_media_type", "bottom_media_src", "bottom_media_file", "bottom_media_type"].includes(name)) update();
    }
    update();
    form.addEventListener("input", onChange);
    form.addEventListener("change", onChange);
    return () => { form.removeEventListener("input", onChange); form.removeEventListener("change", onChange); uploads.forEach(({ url }) => URL.revokeObjectURL(url)); };
  }, []);

  const selected = PLACEMENTS.find(({ key }) => key === active)!;
  const aspect = active === "hero" ? (mobile ? 375 / 430 : 2)
    : active === "homepage" ? (mobile ? 375 / 300 : 321 / 397)
    : active === "bottom" ? (mobile ? 375 / 220 : 860 / 320)
    : (mobile ? 375 / 190 : 300 / 164);
  function change(position: Position) { setPositions((current) => ({ ...current, [active]: position })); }

  return (
    <div ref={rootRef} className="rounded-[14px] border border-black/10 bg-[#faf8f6] p-4">
      <h3 className="font-body text-[15px] font-semibold">Live image framing</h3>
      <p className="mt-1 text-xs leading-relaxed text-black/55">Choose a placement, then drag the image or move the sliders. Save the article to apply your framing.</p>
      {PLACEMENTS.map(({ key, prefix }) => (
        <span key={key}>
          <input type="hidden" name={`${prefix}_x`} value={positions[key][0]} />
          <input type="hidden" name={`${prefix}_y`} value={positions[key][1]} />
        </span>
      ))}
      <label htmlFor={`${id}-placement`} className="mt-4 block text-xs font-semibold">Placement</label>
      <select id={`${id}-placement`} value={active} onChange={(event) => setActive(event.target.value as Placement)} className="mt-2 w-full rounded-lg border border-black/15 bg-white p-2 text-sm">
        {PLACEMENTS.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
      </select>
      <div className="my-3 flex gap-2">
        {[false, true].map((isMobile) => <button key={String(isMobile)} type="button" aria-pressed={mobile === isMobile} onClick={() => setMobile(isMobile)} className={`rounded-lg border px-3 py-1.5 text-xs ${mobile === isMobile ? "border-[#CE2127] bg-white text-[#CE2127]" : "border-black/10"}`}>{isMobile ? "Mobile" : "Desktop"}</button>)}
      </div>
      <CropFrame key={`${active}-${media[active].src}`} media={media[active]} position={positions[active]} onChange={change} aspect={aspect} />
      <p className="mt-2 text-[11px] leading-relaxed text-black/50">{active === "cover" ? "Listing card preview. Cover crops vary with each card’s shape." : active === "homepage" ? "Trending Now card crop." : active === "hero" ? "Article hero crop. The original frame size is preserved." : "Bottom article image crop."}</p>
      {([0, 1] as const).map((axis) => <label key={axis} className="mt-3 block text-xs text-black/65">
        {selected.label}: {axis === 0 ? "horizontal" : "vertical"} ({positions[active][axis]}%)
        <input type="range" min={0} max={100} step={1} value={positions[active][axis]} onChange={(event) => { const next: Position = [...positions[active]]; next[axis] = Number(event.target.value); change(next); }} className="mt-2 block w-full accent-[#CE2127]" />
      </label>)}
      <button type="button" onClick={() => change([50, 50])} className="mt-3 text-xs font-semibold text-[#CE2127]">Reset this placement to center</button>
    </div>
  );
}
