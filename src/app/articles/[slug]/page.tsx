import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ArticleMedia from "@/components/article/ArticleMedia";
import ArticleRichContent from "@/components/article/ArticleRichContent";
import SiteFooter from "@/components/layout/SiteFooter";
import JsonLd from "@/components/seo/JsonLd";
import {
  formatArticleDate,
  hasArticleCategory,
  normalizeYouTubeEmbedUrl,
} from "@/lib/articles";
import {
  getPublicArticleBySlug,
  getPublicArticles,
} from "@/lib/public-articles";
import {
  buildBreadcrumbSchema,
  buildKeywordList,
  buildSeoDescription,
  getDefaultOgImage,
  parseArticleDateToIso,
  SITE_NAME,
  toAbsoluteUrl,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

function getEmbeddedYouTubeVideoId(value?: string | null) {
  const normalized = normalizeYouTubeEmbedUrl(value);

  if (!normalized) {
    return "";
  }

  try {
    const url = new URL(normalized);
    const segments = url.pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] ?? "";
  } catch {
    return "";
  }
}

const CATEGORY_BACK_LINKS: Record<string, { href: string; label: string }> = {
  trending: { href: "/trending", label: "Back to Trending" },
  music: { href: "/music", label: "Back to Music" },
  cinema: { href: "/cinema", label: "Back to Cinema" },
  people: { href: "/people", label: "Back to People" },
  sport: { href: "/sport", label: "Back to Sport" },
  events: { href: "/events", label: "Back to Events" },
  culture: { href: "/culture", label: "Back to Culture" },
};

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublicArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalPath = `/articles/${article.slug}`;
  const canonicalUrl = toAbsoluteUrl(canonicalPath);
  const description = buildSeoDescription(
    article.summary,
    article.intro,
    article.body?.[0]
  );
  const imageUrl = article.image
    ? toAbsoluteUrl(article.image)
    : getDefaultOgImage();
  const publishedTime = parseArticleDateToIso(article.date);
  const tags = buildKeywordList([
    article.category,
    ...(article.categories ?? []),
    ...(article.tags ?? []),
  ]);

  return {
    title: article.title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    keywords: tags,
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: article.title,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          alt: article.title,
        },
      ],
      publishedTime,
      modifiedTime: publishedTime,
      section: article.category,
      tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { slug } = await params;
  const { from } = await searchParams;

  if (from) {
    redirect(`/articles/${slug}`);
  }

  const article = await getPublicArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const allArticles = await getPublicArticles();

  const activeCategory =
    article.category.toLowerCase() === "entertainment"
      ? "events"
      : article.category.toLowerCase();

  const similarCategory = activeCategory;

  const similarArticles = allArticles
    .filter(
      (candidate) =>
        candidate.slug !== article.slug &&
        hasArticleCategory(candidate, similarCategory)
    )
    .slice(0, 3);

  const bodyParagraphs = Array.isArray(article.body)
    ? article.body.filter(
        (paragraph) =>
          typeof paragraph === "string" && paragraph.trim().length > 0
      )
    : [];

  const bodyHtml = article.bodyHtml?.trim();
  const heroMediaType = article.heroMedia?.type === "video" ? "video" : "image";
  const heroMediaSrc = article.heroMedia?.src?.trim() || article.image || "";
  const bottomMediaEmbedUrl =
    article.bottomMedia?.type === "youtube"
      ? normalizeYouTubeEmbedUrl(article.bottomMedia.src)
      : "";
  const bottomMediaVideoId = getEmbeddedYouTubeVideoId(article.bottomMedia?.src);
  const bottomMediaThumbnail = bottomMediaVideoId
    ? `https://i.ytimg.com/vi/${bottomMediaVideoId}/hqdefault.jpg`
    : "";
  const canonicalUrl = toAbsoluteUrl(`/articles/${article.slug}`);
  const socialImageUrl = article.image
    ? toAbsoluteUrl(article.image)
    : getDefaultOgImage();
  const publishedTime = parseArticleDateToIso(article.date);
  const modifiedTime = parseArticleDateToIso(article.date);
  const articleDescription = buildSeoDescription(
    article.summary,
    article.intro,
    bodyParagraphs[0]
  );

  const backLink =
    CATEGORY_BACK_LINKS[activeCategory] ?? {
      href: "/trending",
      label: "Back to Trending",
    };

  const keywordList = buildKeywordList([
    article.category,
    ...(article.categories ?? []),
    ...(article.tags ?? []),
  ]);

  const articleBodyText = bodyParagraphs.join("\n\n");

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
      headline: article.title,
      description: articleDescription,
      image: [socialImageUrl],
      datePublished: publishedTime,
      dateModified: modifiedTime,
      url: canonicalUrl,
      articleSection: article.category,
      keywords: keywordList.join(", "),
      isAccessibleForFree: true,
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        logo: {
          "@type": "ImageObject",
          url: toAbsoluteUrl("/mainstage-logo.png"),
        },
      },
      ...(articleBodyText
        ? {
            articleBody: articleBodyText,
          }
        : {}),
    },
    buildBreadcrumbSchema([
      {
        name: "Home",
        url: toAbsoluteUrl("/"),
      },
      {
        name: backLink.label.replace("Back to ", ""),
        url: toAbsoluteUrl(backLink.href),
      },
      {
        name: article.title,
        url: canonicalUrl,
      },
    ]),
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <section className="mx-auto max-w-[1180px] px-4 py-12 md:px-8 md:py-16">
          <JsonLd data={structuredData} />

          <h1 className="mx-auto max-w-[760px] text-center text-[26px] font-body font-bold leading-[1.2] tracking-[-0.03em] text-[#171717]">
            {article.title}
          </h1>

          <p className="mx-auto mt-3 max-w-[760px] text-center text-[14px] font-body font-normal text-[rgba(0,0,0,0.62)]">
            {formatArticleDate(article.date)}
          </p>

          <div className="mx-auto mt-10 max-w-[860px] overflow-hidden rounded-[9px] bg-[#ddd7cf]">
            {heroMediaType === "video" && heroMediaSrc ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                className="h-[430px] w-full object-cover"
              >
                <source src={heroMediaSrc} type="video/mp4" />
              </video>
            ) : (
              <ArticleMedia
                src={heroMediaSrc}
                alt={article.title}
                className={article.imageClassName ?? ""}
                heightClassName="h-[430px]"
                articleImage={article}
              />
            )}
          </div>

          {article.imageCaption ? (
            <p className="mt-4 text-center text-[12px] font-body font-normal text-[rgba(0,0,0,0.55)]">
              {article.imageCaption}
            </p>
          ) : null}

          <article className="mx-auto mt-10 max-w-[860px]">
            <p className="text-[15px] font-body font-bold leading-[1.95] text-[rgba(0,0,0,0.78)]">
              {article.intro}
            </p>

            {bodyHtml ? (
              <ArticleRichContent html={bodyHtml} />
            ) : (
              <div className="mt-7 space-y-6 text-[15px] font-body font-normal leading-[2] text-[rgba(0,0,0,0.74)]">
                {bodyParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            )}
          </article>

          {article.bottomMedia ? (
            <div className="mx-auto mt-8 max-w-[860px] overflow-hidden rounded-[9px] bg-[#ddd7cf] sm:mt-12">
              {article.bottomMedia.type === "youtube" ? (
                <>
                  {bottomMediaEmbedUrl ? (
                    <div className="hidden sm:block">
                      <iframe
                        className="aspect-video w-full"
                        src={bottomMediaEmbedUrl}
                        title={article.bottomMedia.title ?? article.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                  ) : null}

                  <a
                    href={article.bottomMedia.src}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block sm:hidden"
                    aria-label={`Watch ${article.bottomMedia.title ?? article.title} on YouTube`}
                  >
                    {bottomMediaThumbnail ? (
                      <img
                        src={bottomMediaThumbnail}
                        alt={article.bottomMedia.title ?? article.title}
                        className="aspect-video w-full object-cover"
                      />
                    ) : (
                      <div className="aspect-video w-full bg-[#ece6df]" />
                    )}
                    <div className="absolute inset-0 bg-black/18 transition-colors duration-300 group-hover:bg-black/28" />
                    <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
                      <div className="ml-1 h-0 w-0 border-y-[10px] border-y-transparent border-l-[16px] border-l-[#111]" />
                    </div>
                  </a>
                </>
              ) : (
                <ArticleMedia
                  src={article.bottomMedia.src}
                  alt={article.bottomMedia.title ?? article.title}
                  heightClassName="h-[220px] sm:h-[320px]"
                />
              )}
            </div>
          ) : null}

          <div className="mx-auto mt-8 max-w-[860px] sm:mt-12">
            <h2 className="text-[22px] font-body font-bold tracking-[-0.03em] text-[#181818]">
              Similar articles
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-7 md:grid-cols-3 md:gap-y-8">
              {similarArticles.map((similar) => (
                <article key={similar.slug} className="w-full md:max-w-[300px]">
                  <Link
                    href={`/articles/${similar.slug}`}
                    className="group block transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="h-[190px] overflow-hidden rounded-[8px] bg-[#e4ddd5] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] transition-shadow duration-300 group-hover:shadow-[0_16px_32px_rgba(0,0,0,0.1)] md:h-[164px]">
                      <ArticleMedia
                        src={similar.image}
                        alt={similar.title}
                        className={`transition-transform duration-500 group-hover:scale-[1.03] ${similar.imageClassName ?? ""}`}
                        heightClassName="h-full"
                        articleImage={similar}
                      />
                    </div>
                    <h3 className="mt-3 text-[14px] font-body font-bold leading-[1.35] text-[#171717] transition-colors duration-300 group-hover:text-[#CE2127]">
                      {similar.title}
                    </h3>
                  </Link>
                  <p className="mt-2 text-[11px] font-body font-normal leading-[1.6] text-[rgba(0,0,0,0.62)]">
                    {similar.summary}
                  </p>
                  <p className="mt-2 text-[8px] font-body font-semibold text-[#CE2127]">
                    {similarCategory.charAt(0).toUpperCase() +
                      similarCategory.slice(1)}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-[860px]">
            <Link
              href={backLink.href}
              className="text-[12px] font-body font-semibold text-[#CE2127] hover:opacity-75"
            >
              {backLink.label}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
