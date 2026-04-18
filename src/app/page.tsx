import HeroDrop from "@/components/home/HeroDrop";
import EditorialGrid from "@/components/home/EditorialGrid";
import SiteFooter from "@/components/layout/SiteFooter";
import JsonLd from "@/components/seo/JsonLd";
import {
  buildItemListSchema,
  buildSeoDescription,
  toAbsoluteUrl,
} from "@/lib/seo";
import { getFeedSettings, getHomepageSettings } from "@/lib/supabase/server";
import { getPublicArticles } from "@/lib/public-articles";

export default async function Home() {
  const homepageSettings = await getHomepageSettings();
  const feedSettings = await getFeedSettings();
  const publicArticles = await getPublicArticles();
  const latestArticleList = buildItemListSchema(
    publicArticles.slice(0, 10).map((article) => ({
      name: article.title,
      url: toAbsoluteUrl(`/articles/${article.slug}`),
    }))
  );
  const homepageStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Mainstage",
      url: toAbsoluteUrl("/"),
      description: buildSeoDescription(
        "A platform built for culture, entertainment, and the people shaping what's next."
      ),
    },
    latestArticleList,
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={homepageStructuredData} />
      <HeroDrop
        slides={homepageSettings.heroSlides}
        title={homepageSettings.heroTitle}
        category={homepageSettings.heroCategory}
        href={homepageSettings.heroHref}
        media={homepageSettings.heroMedia}
      />
      <EditorialGrid
        key={homepageSettings.mustReadSlug}
        mustReadSlug={homepageSettings.mustReadSlug}
        bannerImage={homepageSettings.bannerImage}
        bannerHref={homepageSettings.bannerHref}
        socialItems={homepageSettings.socialItems}
        spotifyTopTen={feedSettings.spotify.tracks.slice(0, 10)}
        youtubeTopVideos={feedSettings.youtube.videos.slice(0, 4)}
        initialArticles={publicArticles}
      />
      <SiteFooter />
    </div>
  );
}
