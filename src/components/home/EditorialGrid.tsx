"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, ChevronDown, ChevronUp, Minus } from "lucide-react";
import {
  formatArticleDate,
  getDisplayCategoryLabel,
  getArticleImageStyle,
  HOMEPAGE_MUST_READ_SLUG,
  ArticleRecord,
} from "@/lib/articles";
import { usePublicArticles } from "@/lib/use-public-articles";
import { SPOTIFY_TOP_TEN } from "@/lib/spotify";
import { formatYouTubeDate, YOUTUBE_MOROCCO_TOP_VIDEOS } from "@/lib/youtube";

function formatPlays(value?: number | null) {
  if (typeof value !== "number") {
    return "—";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

function getShortVideoDescription(value?: string) {
  if (!value) return "";

  const cleaned = value.replace(/\s+/g, " ").trim();

  if (cleaned.length <= 120) {
    return cleaned;
  }

  return `${cleaned.slice(0, 117).trimEnd()}...`;
}

function ChartMovement({ value }: { value?: string }) {
  if (!value || value === "=") {
    return (
      <span className="inline-flex items-center justify-center text-white/60">
        <Minus size={14} strokeWidth={2.4} />
      </span>
    );
  }

  const isUp = value.startsWith("+");

  return (
    <span
      className={`inline-flex items-center justify-center ${
        isUp ? "text-[#56d364]" : "text-[#ff5f56]"
      }`}
    >
      {isUp ? (
        <ChevronUp size={15} strokeWidth={2.8} />
      ) : (
        <ChevronDown size={15} strokeWidth={2.8} />
      )}
    </span>
  );
}

const SOCIAL_ITEMS = [
  {
    id: 1,
    image: "/social/2.png",
    alt: "Mainstage social highlight 1",
  },
  {
    id: 2,
    image: "/social/11.png",
    alt: "Mainstage social highlight 2",
  },
  {
    id: 3,
    image: "/social/3.png",
    alt: "Mainstage social highlight 3",
  },
  {
    id: 4,
    image: "/social/15.png",
    alt: "Mainstage social highlight 4",
  },
  {
    id: 5,
    image: "/social/18.png",
    alt: "Mainstage social highlight 5",
  },
];

const SOCIAL_CARD_WIDTH = 322;
const SOCIAL_CARD_GAP = 24;
const SOCIAL_STEP = SOCIAL_CARD_WIDTH + SOCIAL_CARD_GAP;
const SOCIAL_LOOP_WIDTH = SOCIAL_STEP * SOCIAL_ITEMS.length;

type EditorialGridProps = {
  mustReadSlug?: string;
  bannerImage?: string;
  bannerHref?: string;
  socialItems?: Array<{
    image: string;
    href: string;
  }>;
  initialArticles?: ArticleRecord[];
};

export default function EditorialGrid({
  mustReadSlug,
  bannerImage,
  bannerHref,
  socialItems,
  initialArticles,
}: EditorialGridProps) {
  const publicArticles = usePublicArticles();
  const articlesMap =
    initialArticles?.length && Object.keys(publicArticles.articlesMap).length === 0
      ? Object.fromEntries(initialArticles.map((article) => [article.slug, article])) as Record<
          string,
          ArticleRecord
        >
      : publicArticles.articlesMap;
const sortedCards = publicArticles.sortedCards;
const trendingItems = (sortedCards.length ? sortedCards : [])
  .map((article) => ({
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    category: article.category,
    categories: article.categories,
    image: article.image,
    imageClassName: article.imageClassName,
  }))
  .slice(0, 3);

  const mustRead =
    articlesMap[mustReadSlug ?? HOMEPAGE_MUST_READ_SLUG] ??
    articlesMap[HOMEPAGE_MUST_READ_SLUG];

  const homepageBannerImage = bannerImage?.trim() || "/home-banner-ad.png";
  const homepageBannerHref = bannerHref?.trim() || "";
  const homepageSocialItems =
    socialItems?.length === 5
      ? socialItems
      : SOCIAL_ITEMS.map((item) => ({ image: item.image, href: "" }));

  return (
    <section className="overflow-x-hidden bg-white">
      <div className="mx-auto max-w-[1116px] px-4 py-16 md:px-6 md:py-18">
        <div className="mb-11 flex items-center justify-between gap-6">
          <h2 className="text-[25px] font-body font-bold tracking-[-0.03em] text-[#181818]">
            Trending Now
          </h2>

          <Link
            href="/trending"
            className="inline-flex cursor-pointer items-center gap-2 text-[16px] font-body font-semibold text-[#CE2127] transition-opacity hover:opacity-75"
          >
            Discover more
            <ArrowRight size={16} strokeWidth={2.2} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-x-[36px] gap-y-12 md:grid-cols-2 xl:grid-cols-3">
          {trendingItems.map((item, index) => (
            <motion.article
              key={item.slug}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
              className="group"
            >
              <Link
                href={`/articles/${item.slug}?from=trending`}
                className="block cursor-pointer transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="h-[300px] w-full overflow-hidden rounded-[9px] bg-[#ece7e2] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] transition-shadow duration-300 group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.12)] sm:h-[340px] md:h-[397px] md:max-w-[321px]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${item.imageClassName ?? ""}`}
style={getArticleImageStyle({
  imagePositionX:
    typeof (item as any).imagePositionX === "number"
      ? (item as any).imagePositionX
      : undefined,
  imagePositionY:
    typeof (item as any).imagePositionY === "number"
      ? (item as any).imagePositionY
      : undefined,
})}
                  />
                </div>

                <div className="pt-5 md:max-w-[321px]">
                  <p className="mb-2 text-[11px] font-body font-normal text-[rgba(0,0,0,0.62)]">
                    {formatArticleDate(articlesMap[item.slug]?.date)}
                  </p>
                  <p className="mb-1 text-[10px] font-body font-bold text-[#CE2127]">
                    {getDisplayCategoryLabel(item.category)}
                  </p>
                  <h3 className="text-[20px] font-body font-semibold leading-[1.42] tracking-[-0.02em] text-[#181818] transition-colors duration-300 group-hover:text-[#CE2127]">
                    {item.title}
                  </h3>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="mt-20">
          <div className="mb-11 flex items-center justify-between gap-6">
            <h2 className="text-[25px] font-body font-bold tracking-[-0.03em] text-[#181818]">
              The Must-Read
            </h2>

            {mustRead ? (
              <Link
                href={`/articles/${mustRead.slug}?from=${mustRead.category.toLowerCase()}`}
                className="inline-flex cursor-pointer items-center gap-2 text-[16px] font-body font-semibold text-[#CE2127] transition-opacity hover:opacity-75"
              >
                Discover more
                <ArrowRight size={16} strokeWidth={2.2} />
              </Link>
            ) : null}
          </div>

          {mustRead ? (
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="grid grid-cols-1 gap-8 lg:grid-cols-[561px_minmax(0,1fr)] lg:items-start"
          >
            <Link
              href={`/articles/${mustRead.slug}?from=${mustRead.category.toLowerCase()}`}
              className="group block cursor-pointer transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="h-[240px] w-full overflow-hidden rounded-[9px] bg-[#ece7e2] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] transition-shadow duration-300 group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.12)] sm:h-[300px] lg:h-[332px] lg:max-w-[561px]">
                <img
                  src={mustRead.image}
                  alt={mustRead.title}
                  className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${mustRead.imageClassName ?? ""}`}
                  style={getArticleImageStyle(mustRead)}
                />
              </div>
            </Link>

            <div className="flex w-full flex-col justify-between py-1 lg:h-[332px] lg:max-w-[561px]">
              <div>
              <p className="text-[15px] font-body font-normal text-[rgba(0,0,0,0.8)]">
                {formatArticleDate(mustRead.date)}
              </p>
              <Link
                href={`/articles/${mustRead.slug}?from=${mustRead.category.toLowerCase()}`}
                className="block cursor-pointer"
              >
                <h3 className="mt-4 w-full text-[25px] font-body font-bold leading-[1.35] tracking-[-0.02em] text-[#181818] transition-colors duration-300 hover:text-[#CE2127] lg:max-w-[561px]">
                  {mustRead.title}
                </h3>
              </Link>
              <p
                className="mt-4 w-full overflow-hidden text-[18px] font-body font-light leading-[1.55] text-black/80 sm:text-[20px] lg:max-w-[561px]"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 5,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {[mustRead.summary, mustRead.intro].filter(Boolean).join(" ")}
              </p>
              </div>
              <p className="mt-4 w-full text-[15px] font-body font-semibold text-[#CE2127] lg:max-w-[561px]">
                {mustRead.category}
              </p>
            </div>
          </motion.article>
          ) : null}
        </div>

        <div className="mt-10">
          <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-black">
            {homepageBannerHref ? (
              <a
                href={homepageBannerHref}
                className="block cursor-pointer"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={homepageBannerImage}
                  alt="Mainstage banner ad"
                  className="h-[120px] w-full object-cover object-top"
                />
              </a>
            ) : (
              <img
                src={homepageBannerImage}
                alt="Mainstage banner ad"
                className="h-[120px] w-full object-cover object-top"
              />
            )}
          </div>
        </div>

        <div className="mt-20">
          <div className="mb-11 flex items-center justify-between gap-6">
            <h2 className="text-[25px] font-body font-bold tracking-[-0.03em] text-[#181818]">
              Social Highlights
            </h2>

            <a
              href="#"
              className="inline-flex cursor-pointer items-center gap-2 text-[16px] font-body font-semibold text-[#CE2127] transition-opacity hover:opacity-75"
            >
              Discover more
              <ArrowRight size={16} strokeWidth={2.2} />
            </a>
          </div>

          <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-1">
            <motion.div
              animate={{ x: [-118, -118 - SOCIAL_LOOP_WIDTH] }}
              transition={{ duration: 22, ease: "linear", repeat: Infinity }}
              className="flex gap-6 px-0"
            >
              {[...homepageSocialItems, ...homepageSocialItems].map((item, index) => (
                <article
                  key={`${item.image}-${index}`}
                  className="h-[401px] w-[322px] shrink-0 overflow-hidden rounded-[9px] bg-[#ece7e2]"
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="block h-full w-full cursor-pointer"
                    >
                      <img
                        src={item.image}
                        alt="Mainstage social highlight"
                        className="h-full w-full object-cover"
                      />
                    </a>
                  ) : (
                    <img
                      src={item.image}
                      alt="Mainstage social highlight"
                      className="h-full w-full object-cover"
                    />
                  )}
                </article>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1fr)_438px] xl:items-start">
          <div>
            <div className="mb-10 flex items-center justify-between gap-6">
              <h2 className="text-[25px] font-body font-bold tracking-[-0.03em] text-[#181818]">
                Trending Now in Morocco
              </h2>
            </div>

            <div className="space-y-6">
              {YOUTUBE_MOROCCO_TOP_VIDEOS.map((item) => (
                <article
                  key={item.id}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-5 lg:grid-cols-[268px_320px]"
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block h-[200px] w-full cursor-pointer overflow-hidden rounded-[12px] bg-[#e8e2db] transition-transform duration-300 hover:-translate-y-1 sm:h-[145px] sm:w-[220px] lg:w-[268px]"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-white text-black shadow-[0_8px_24px_rgba(0,0,0,0.22)]">
                        <Play size={22} fill="currentColor" className="ml-1" />
                      </div>
                    </div>
                  </a>

                  <div className="flex min-w-0 flex-col overflow-hidden pt-1 sm:h-[145px] sm:w-full lg:w-[320px]">
                    <p className="w-full text-[13px] font-body font-medium text-[rgba(0,0,0,0.72)]">
                      {item.channel}
                    </p>
                    <p className="mt-1 w-full text-[13px] font-body font-normal text-[rgba(0,0,0,0.58)]">
                      {formatYouTubeDate(item.publishedAt)}
                    </p>
                    <h3
                      className="mt-3 w-full overflow-hidden text-[18px] font-body font-bold leading-[1.35] text-[#181818] transition-colors duration-300 group-hover:text-[#CE2127]"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="mt-2 w-full overflow-hidden text-[14px] font-body font-normal leading-[1.45] text-[rgba(0,0,0,0.5)]"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {getShortVideoDescription(item.description)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-10 flex items-center gap-4">
              <h2 className="text-[25px] font-body font-bold tracking-[-0.03em] text-[#181818]">
                On Repeat
              </h2>
              <span className="h-[10px] w-[10px] rounded-full bg-[#CE2127]" />
            </div>

            <div className="overflow-hidden rounded-[14px]">
              <div className="grid grid-cols-[82px_minmax(0,1fr)_84px] bg-[#CE2127] px-4 py-4 text-[13px] font-body font-semibold text-white sm:grid-cols-[112px_minmax(0,1fr)_110px] sm:px-5 sm:text-[15px]">
                <span>Rank</span>
                <span>Title</span>
                <span>Plays</span>
              </div>

              <div>
                {SPOTIFY_TOP_TEN.map((item, index) => (
                  <div
                    key={item.rank}
                    className={`grid grid-cols-[82px_minmax(0,1fr)_84px] items-center px-4 py-3 sm:grid-cols-[112px_minmax(0,1fr)_110px] sm:px-5 ${
                      index % 2 === 0 ? "bg-[#727272]" : "bg-[#868686]"
                    } text-white`}
                  >
                    <div className="flex items-center gap-2 text-[13px] font-body font-medium sm:gap-3 sm:text-[15px]">
                      <span>{item.rank}</span>
                      <ChartMovement value={item.chartChange} />
                    </div>

                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <div className="h-[34px] w-[34px] shrink-0 overflow-hidden rounded-[4px] bg-black/20 sm:h-[42px] sm:w-[42px]">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-body font-medium leading-none sm:text-[15px]">
                          {item.title}
                        </p>
                        <p className="mt-1 truncate text-[10px] font-body font-normal text-white/55 sm:text-[12px]">
                          {item.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <span className="text-[11px] font-body font-semibold leading-none tabular-nums sm:text-[13px]">
                        {formatPlays(item.plays)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
