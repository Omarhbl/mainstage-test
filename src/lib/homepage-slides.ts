import type { CSSProperties } from "react";

export type HomepageHeroSlide = {
  title: string;
  category: string;
  href: string;
  media: string;
  positionX?: number;
  positionY?: number;
  mobilePositionX?: number;
  mobilePositionY?: number;
};

export function clampSlidePosition(value: unknown, fallback = 50) {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : fallback;
}

export function getSlideMediaStyle(slide: HomepageHeroSlide): CSSProperties {
  const x = clampSlidePosition(slide.positionX);
  const y = clampSlidePosition(slide.positionY);
  return {
    "--slide-desktop-position": `${x}% ${y}%`,
    "--slide-mobile-position": `${clampSlidePosition(slide.mobilePositionX, x)}% ${clampSlidePosition(slide.mobilePositionY, y)}%`,
  } as CSSProperties;
}

export function isSlideVideo(src: string) {
  return /\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(src);
}
