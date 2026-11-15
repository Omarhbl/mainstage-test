import { parseSeoDate } from "./seo-data";

type NewsArticle = { slug: string; title: string; date: string };
function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[character]!);
}

/** Use the original editorial publication date, never the modification or sitemap generation date. */
export function buildNewsSitemap(articles: NewsArticle[], siteUrl: string, now = Date.now()) {
  const today = new Date(now).toISOString().slice(0, 10);
  const yesterday = new Date(now - 86400000).toISOString().slice(0, 10);
  const seen = new Set<string>();
  const entries = articles.map((article) => ({ article, date: parseSeoDate(article.date) }))
    .filter((entry): entry is { article: NewsArticle; date: string } => !!entry.date)
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(({ article, date }) => {
      const slug = article.slug.trim();
      const hasTime = article.date.includes("T");
      const recent = hasTime ? Date.parse(date) <= now && Date.parse(date) >= now - 2 * 86400000 : date.slice(0, 10) >= yesterday && date.slice(0, 10) <= today;
      if (!recent || !slug || !article.title.trim() || seen.has(slug)) return false;
      seen.add(slug);
      return true;
    }).slice(0, 1000)
    .map(({ article, date }) => `<url><loc>${escapeXml(`${siteUrl.replace(/\/$/, "")}/articles/${article.slug.trim()}`)}</loc><news:news><news:publication><news:name>Mainstage</news:name><news:language>en</news:language></news:publication><news:publication_date>${article.date.includes("T") ? date : date.slice(0, 10)}</news:publication_date><news:title>${escapeXml(article.title.trim())}</news:title></news:news></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${entries.join("\n")}</urlset>`;
}
