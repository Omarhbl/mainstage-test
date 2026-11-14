export type ArticleAdSettings = {
  enabled: boolean;
  desktopImage: string;
  mobileImage: string;
  href: string;
};

export const EMPTY_ARTICLE_AD: ArticleAdSettings = { enabled: false, desktopImage: "", mobileImage: "", href: "" };

export function safeAdUrl(value: unknown, image = false): string {
  if (typeof value !== "string") return "";
  const text = value.trim();
  if (/^\/(?!\/)/.test(text) && !/[\\\u0000-\u0020]/.test(text)) return text;
  try {
    const url = new URL(text);
    return url.protocol === "https:" || (!image && url.protocol === "http:") ? url.href : "";
  } catch { return ""; }
}

export function normalizeArticleAd(value: unknown): ArticleAdSettings {
  const ad = value && typeof value === "object" ? value as Partial<ArticleAdSettings> : {};
  const desktopImage = safeAdUrl(ad.desktopImage, true);
  const mobileImage = safeAdUrl(ad.mobileImage, true);
  return { enabled: ad.enabled === true && Boolean(desktopImage && mobileImage), desktopImage, mobileImage, href: safeAdUrl(ad.href) };
}
