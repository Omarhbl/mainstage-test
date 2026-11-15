import type { MetadataRoute } from "next";
import { getPublicArticles } from "@/lib/public-articles";
import { toAbsoluteUrl } from "@/lib/seo";
import { articleModifiedDate } from "@/lib/seo-data";

export const revalidate = 3600;

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: ChangeFrequency;
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
  { path: "/guestlist", changeFrequency: "monthly", priority: 0.5 },
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
  const articles = await getPublicArticles();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: toAbsoluteUrl(route.path),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const articleEntries: MetadataRoute.Sitemap = [];
  const seenArticleSlugs = new Set<string>();

  for (const article of articles) {
    const slug = typeof article.slug === "string" ? article.slug.trim() : "";

    if (!slug || seenArticleSlugs.has(slug)) {
      continue;
    }

    seenArticleSlugs.add(slug);

    const modified = articleModifiedDate(article);

    articleEntries.push({
      url: toAbsoluteUrl(`/articles/${slug}`),
      ...(modified ? { lastModified: modified } : {}),
      changeFrequency: "weekly",
      priority: 0.82,
    });
  }

  return [...staticEntries, ...articleEntries];
}
