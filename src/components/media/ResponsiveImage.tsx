"use client";

import { useState, type ImgHTMLAttributes } from "react";
import { responsiveImageProps } from "@/lib/responsive-images";

type Props = ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string; maxWidth?: number };

export default function ResponsiveImage({ src, alt, sizes = "(max-width: 767px) 100vw, 50vw", maxWidth = 1280, onError, ...props }: Props) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const delivery = failedSource === src ? { src } : responsiveImageProps(src, sizes, maxWidth);
  return <img {...props} {...delivery} alt={alt} onError={event => {
    if (delivery.src !== src) { setFailedSource(src); return; }
    onError?.(event);
  }} />;
}
