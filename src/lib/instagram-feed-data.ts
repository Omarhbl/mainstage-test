export type InstagramHighlight = { image: string; href: string; alt: string };

function httpsUrl(value: unknown, instagramOnly = false) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return "";
    if (instagramOnly && !["instagram.com", "www.instagram.com"].includes(url.hostname)) return "";
    return url.href;
  } catch { return ""; }
}

export function parseInstagramHighlights(value: unknown): InstagramHighlight[] {
  if (!value || typeof value !== "object" || !Array.isArray((value as { data?: unknown }).data)) return [];
  const seen = new Set<string>();
  return ((value as { data: Record<string, unknown>[] }).data)
    .filter((post) => post && typeof post === "object")
    .sort((a, b) => (Date.parse(String(b.timestamp)) || 0) - (Date.parse(String(a.timestamp)) || 0))
    .flatMap((post) => {
      const href = httpsUrl(post.permalink, true);
      const image = httpsUrl(post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url);
      if (!image || !href || seen.has(href)) return [];
      seen.add(href);
      return [{ image, href, alt: typeof post.caption === "string" && post.caption.trim() ? post.caption.trim().slice(0, 180) : "Mainstage Instagram post" }];
    }).slice(0, 5);
}
