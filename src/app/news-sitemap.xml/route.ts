import { getPublicArticles } from "@/lib/public-articles";
import { getSiteUrl } from "@/lib/seo";
import { buildNewsSitemap } from "@/lib/news-sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await getPublicArticles();
  return new Response(buildNewsSitemap(articles, getSiteUrl()), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
