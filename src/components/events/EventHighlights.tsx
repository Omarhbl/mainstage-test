"use client";
import { useEffect, useRef } from "react";
import type { UpcomingItem } from "@/lib/upcoming";
import { formatReleaseDate } from "@/lib/upcoming";
const STEP = 232;
export default function EventHighlights({ items }: { items: (UpcomingItem & { imageFit?: "contain" })[] }) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; time: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const animate = items.length > 5, duration = Math.max(22, items.length * 3) * 1000;
  const shift = useRef(STEP * items.length);
  useEffect(() => {
    const element = track.current;
    if (!element || !animate) return;
    const measure = () => {
      shift.current = Array.from(element.children).slice(0, items.length).reduce((total, card) => total + card.getBoundingClientRect().width + 14, 0);
      element.style.setProperty("--upcoming-shift", `${shift.current}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    Array.from(element.children).slice(0, items.length).forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [animate, items]);
  const seek = (time: number) => { const animation = track.current?.getAnimations()[0]; if (animation) animation.currentTime = ((time % duration) + duration) % duration; };
  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    track.current?.getAnimations()[0]?.play();
  }
  return <div className={animate ? "relative left-1/2 mt-8 w-screen -translate-x-1/2 overflow-hidden py-1" : "mt-8 py-1"}>
    <div ref={track} role="region" aria-label="Upcoming events" tabIndex={animate ? 0 : undefined}
      className={animate ? "upcoming-marquee-track flex cursor-grab select-none gap-[14px] active:cursor-grabbing" : "flex flex-wrap justify-center gap-x-[14px] gap-y-6"}
      style={{ touchAction: "pan-y", "--upcoming-offset": "-110px", "--upcoming-duration": `${duration / 1000}s` } as React.CSSProperties}
      onDragStart={(event) => event.preventDefault()}
      onPointerDown={(event) => {
        if (!animate || (event.pointerType === "mouse" && event.button !== 0)) return;
        const animation = track.current?.getAnimations()[0]; if (!animation) return;
        animation.pause(); suppressClick.current = false;
        drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, time: Number(animation.currentTime ?? 0), moved: false };
      }}
      onPointerMove={(event) => {
        const current = drag.current; if (!current || current.id !== event.pointerId) return;
        const delta = current.x - event.clientX;
        if (!current.moved && Math.abs(delta) > 8 && Math.abs(delta) > Math.abs(current.y - event.clientY)) {
          current.moved = true; suppressClick.current = true; event.currentTarget.setPointerCapture(event.pointerId);
        }
        if (current.moved) seek(current.time + delta * duration / shift.current);
      }}
      onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") track.current?.getAnimations()[0]?.pause(); }}
      onPointerLeave={() => { if (!drag.current?.moved) { drag.current = null; track.current?.getAnimations()[0]?.play(); } }}
      onClickCapture={(event) => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}
      onKeyDown={(event) => { if (animate && ["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); seek(Number(track.current?.getAnimations()[0]?.currentTime ?? 0) + (event.key === "ArrowRight" ? 1 : -1) * STEP * duration / shift.current); } }}>
      {(animate ? [...items, ...items, ...items] : items).map((item, index) => <article key={`${item.id}-${index}`} className={`${item.imageFit === "contain" ? "w-[352px] sm:w-[539px]" : item.image.includes("/event/square_card/") ? "w-[200px] sm:w-[306px]" : "w-[143px] sm:w-[218px]"} shrink-0`}>
        <div className="h-[200px] overflow-hidden rounded-[8px] bg-[#e8e2db] sm:h-[306px]">
          {item.href ? <a href={item.href} target="_blank" rel="noreferrer" className="block h-full w-full"><img draggable={false} src={item.image} alt={item.title} className={`h-full w-full ${item.imageFit === "contain" ? "object-contain" : "object-cover"}`} /></a> : <img draggable={false} src={item.image} alt={item.title} className={`h-full w-full ${item.imageFit === "contain" ? "object-contain" : "object-cover"}`} />}
        </div>
        <div className="pt-3"><p className="text-[11px] font-body font-semibold text-black/48 uppercase">{formatReleaseDate(item.releaseDate)}</p><h3 className="mt-1 text-[14px] font-body font-semibold leading-[1.35] text-[#181818]">{item.title}</h3></div>
      </article>)}
    </div>
  </div>;
}
