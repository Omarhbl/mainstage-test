"use client";

import { useState } from "react";
import ImageCropFrame from "@/components/backoffice/ImageCropFrame";
import { clampSlidePosition, isSlideVideo, type HomepageHeroSlide } from "@/lib/homepage-slides";

type FramingField = "positionX" | "positionY" | "mobilePositionX" | "mobilePositionY";

export default function HomepageSlideFraming({ slide, index, onChange }: {
  slide: HomepageHeroSlide;
  index: number;
  onChange: (field: FramingField, value: number) => void;
}) {
  const [mobile, setMobile] = useState(false);
  const x = clampSlidePosition(slide.positionX);
  const y = clampSlidePosition(slide.positionY);
  const mobileX = clampSlidePosition(slide.mobilePositionX, x);
  const mobileY = clampSlidePosition(slide.mobilePositionY, y);
  const position: [number, number] = mobile ? [mobileX, mobileY] : [x, y];
  const fields: [FramingField, FramingField] = mobile ? ["mobilePositionX", "mobilePositionY"] : ["positionX", "positionY"];
  const device = mobile ? "Mobile" : "Desktop";

  function change(next: [number, number]) {
    // Freeze the inherited mobile position when desktop framing first changes.
    if (!mobile) {
      if (slide.mobilePositionX === undefined) onChange("mobilePositionX", mobileX);
      if (slide.mobilePositionY === undefined) onChange("mobilePositionY", mobileY);
    }
    onChange(fields[0], next[0]);
    onChange(fields[1], next[1]);
  }

  return (
    <div className="mt-5 rounded-[14px] border border-black/10 bg-white p-4">
      <h3 className="text-sm font-body font-semibold">Live slide framing</h3>
      <p className="mt-1 text-xs leading-relaxed text-black/55">Drag the media or use the sliders. Desktop and mobile positions are saved separately for this slide.</p>
      <input type="hidden" name={`hero_position_x_${index + 1}`} value={x} />
      <input type="hidden" name={`hero_position_y_${index + 1}`} value={y} />
      <input type="hidden" name={`hero_mobile_position_x_${index + 1}`} value={mobileX} />
      <input type="hidden" name={`hero_mobile_position_y_${index + 1}`} value={mobileY} />
      <div className="my-3 flex gap-2">
        {[false, true].map((isMobile) => <button key={String(isMobile)} type="button" aria-pressed={mobile === isMobile} onClick={() => setMobile(isMobile)} className={`rounded-lg border px-3 py-1.5 text-xs ${mobile === isMobile ? "border-[#CE2127] bg-white text-[#CE2127]" : "border-black/10"}`}>{isMobile ? "Mobile" : "Desktop"}</button>)}
      </div>
      <div className={mobile ? "mx-auto max-w-[300px]" : "w-full"}>
        <ImageCropFrame key={slide.media} media={{ src: slide.media, type: isSlideVideo(slide.media) ? "video" : "image" }} position={position} onChange={change}
          aspect={mobile ? 390 / (844 * 0.68) : 1440 / (900 * 0.68)} scale={1.02}
          overlay={<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-4 pt-10 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-wider">{slide.category}</p>
            <p className="mt-1 text-base font-bold leading-tight">{slide.title || "Slide title"}</p>
          </div>} />
      </div>
      <p className="mt-2 text-[11px] text-black/50">Representative {device.toLowerCase()} frame. The visible crop varies with screen size.</p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {([0, 1] as const).map((axis) => <label key={axis} className="block text-xs text-black/65">
          Slide {index + 1} {device.toLowerCase()} {axis === 0 ? "horizontal" : "vertical"} ({position[axis]}%)
          <input type="range" min={0} max={100} step={1} value={position[axis]} onChange={(event) => { const next: [number, number] = [...position]; next[axis] = Number(event.target.value); change(next); }} className="mt-2 block w-full accent-[#CE2127]" />
        </label>)}
      </div>
      <button type="button" onClick={() => change([50, 50])} className="mt-3 text-xs font-semibold text-[#CE2127]">Center {device.toLowerCase()} crop</button>
    </div>
  );
}
