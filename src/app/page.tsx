import { getInstagramFeed } from "@/lib/instagram-feed";
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
  const [homepageSettings, feedSettings, publicArticles, instagram] = await Promise.all([
    getHomepageSettings(), getFeedSettings(), getPublicArticles(), getInstagramFeed(),
  ]);
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
        "Discover Moroccan music, events, cinema, interviews, and culture stories on Mainstage."
      ),
    },
    latestArticleList,
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <h1 className="sr-only">Mainstage: Moroccan Music, Events, Cinema &amp; Culture</h1>
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
        socialItems={instagram.items.length ? instagram.items : homepageSettings.socialItems}
        spotifyTopTen={feedSettings.spotify.tracks.slice(0, 10)}
        youtubeTopVideos={feedSettings.youtube.videos.slice(0, 4)}
        initialArticles={publicArticles}
      />
      <SiteFooter />
    </div>
  );
}
