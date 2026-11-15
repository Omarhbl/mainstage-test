const WIDTHS = [320, 640, 960, 1280, 1920];

/** Resize only known public image delivery URLs. Never alter signed media URLs. */
export function responsiveImageUrl(src: string, width: number): string {
  const bounded = Math.max(320, Math.min(1920, Math.round(width)));
  const cloudinary = src.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/[^?#]+)$/);
  if (cloudinary && !/\.(?:svg|gif|pdf)$/i.test(cloudinary[2])) {
    return `${cloudinary[1]}c_limit,w_${bounded}/q_auto/f_auto/${cloudinary[2]}`;
  }
  // Vogue's public image CDN already exposes a width transformation in these URLs.
  if (/^https:\/\/media\.vogue\.fr\/photos\//.test(src) && /\/w_\d+%2Cc_limit\//i.test(src)) {
    return src.replace(/\/w_\d+%2Cc_limit\//i, `/w_${bounded}%2Cc_limit/`);
  }
  return src;
}

export function responsiveImageProps(src: string, sizes: string, maxWidth = 1280) {
  const limit = WIDTHS.includes(maxWidth) ? maxWidth : 1280;
  const optimized = responsiveImageUrl(src, limit);
  if (optimized === src) return { src };
  return {
    src: optimized,
    srcSet: WIDTHS.filter(width => width <= limit).map(width => `${responsiveImageUrl(src, width)} ${width}w`).join(", "),
    sizes,
  };
}
