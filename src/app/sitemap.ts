import type { MetadataRoute } from "next";
import { getPublicArticles } from "@/lib/public-articles";
import { parseArticleDateToIso, toAbsoluteUrl } from "@/lib/seo";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/trending", changeFrequency: "daily", priority: 0.95 },
  { path: "/music", changeFrequency: "daily", priority: 0.9 },
  { path: "/cinema", changeFrequency: "daily", priority: 0.88 },
  { path: "/people", changeFrequency: "daily", priority: 0.88 },
  { path: "/sport", changeFrequency: "daily", priority: 0.86 },
  { path: "/events", changeFrequency: "daily", priority: 0.86 },
  { path: "/culture", changeFrequency: "daily", priority: 0.86 },
  { path: "/about", changeFrequency: "monthly", priority: 0.55 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/music/top-50", changeFrequency: "hourly", priority: 0.78 },
  { path: "/cinema/articles", changeFrequency: "weekly", priority: 0.7 },
  { path: "/people/articles", changeFrequency: "weekly", priority: 0.7 },
  { path: "/events/articles", changeFrequency: "weekly", priority: 0.7 },
  { path: "/terms-conditions", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/intellectual-property", changeFrequency: "yearly", priority: 0.25 },
  { path: "/cookies-privacy", changeFrequency: "yearly", priority: 0.25 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const articles = await getPublicArticles();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: toAbsoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: toAbsoluteUrl(`/articles/${article.slug}`),
    lastModified: parseArticleDateToIso(article.date) ?? now.toISOString(),
    changeFrequency: "weekly",
    priority: 0.82,
  }));

  return [...staticEntries, ...articleEntries];
}
