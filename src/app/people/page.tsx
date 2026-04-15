"use client";

import Link from "next/link";
import { useState } from "react";
import SiteFooter from "@/components/layout/SiteFooter";
import {
  formatArticleDate,
  getArticleImageStyle,
  hasArticleCategory,
} from "@/lib/articles";
import { usePublicArticles } from "@/lib/use-public-articles";

const INITIAL_VISIBLE_COUNT = 3;

export default function PeoplePage() {
  const { sortedCards, articlesMap } = usePublicArticles();
  const peopleItems = sortedCards.filter((item) => hasArticleCategory(item, "people"));
  const featureStory = peopleItems[0] ? articlesMap[peopleItems[0].slug] : null;
  const [showAllArticles, setShowAllArticles] = useState(false);
  const gridItems = featureStory
    ? peopleItems.filter((item) => item.slug !== featureStory.slug)
    : peopleItems;
  const visibleItems = showAllArticles
    ? gridItems
    : gridItems.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMoreArticles = gridItems.length > INITIAL_VISIBLE_COUNT;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-[1116px] px-4 md:px-6">
            <h1 className="text-center text-[31px] font-body font-bold tracking-[-0.03em] text-[#1a1a1a]">
              Faces of the moment
            </h1>
            <p className="mx-auto mt-4 max-w-[860px] text-center text-[18px] font-body font-normal leading-[1.7] text-[rgba(0,0,0,0.72)]">
              A closer look at the faces defining our era. From established icons to emerging talents, People captures the stories, influence, and cultural shifts driven by those at the center of attention across the world.
            </p>

            <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[563px_minmax(0,1fr)] lg:items-start">
              {featureStory ? (
                <Link
                  href={`/articles/${featureStory.slug}?from=people`}
                  className="group block transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="h-[314px] w-full max-w-[563px] overflow-hidden rounded-[9px] bg-[#e7e1db] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] transition-shadow duration-300 group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
                    <img
                      src={featureStory.image}
                      alt={featureStory.title}
                      className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${featureStory.imageClassName ?? ""}`}
                      style={getArticleImageStyle(featureStory)}
                    />
                  </div>
                </Link>
              ) : null}

              {featureStory ? (
                <div className="max-w-[370px] pt-1">
                  <p className="text-[11px] font-body font-normal text-[rgba(0,0,0,0.65)]">
                    {formatArticleDate(featureStory.date)}
                  </p>
                  <Link href={`/articles/${featureStory.slug}?from=people`} className="block">
                    <h2 className="mt-2 text-[34px] font-body font-bold leading-[1.12] tracking-[-0.04em] text-[#161616] transition-colors duration-300 hover:text-[#CE2127]">
                      {featureStory.title}
                    </h2>
                  </Link>
                  <p className="mt-4 text-[14px] font-body font-normal leading-[1.65] text-[rgba(0,0,0,0.65)]">
                    {featureStory.summary}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-14 grid grid-cols-1 gap-x-[28px] gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {visibleItems.map((item, index) => (
                <article key={`${item.slug}-${index}`} className="max-w-[321px]">
                  <Link
                    href={`/articles/${item.slug}?from=people`}
                    className="group block transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="h-[191px] w-full overflow-hidden rounded-[8px] bg-[#e7e1db] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] transition-shadow duration-300 group-hover:shadow-[0_16px_32px_rgba(0,0,0,0.1)]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${item.imageClassName ?? ""}`}
                        style={getArticleImageStyle(item)}
                      />
                    </div>

                    <div className="pt-4">
                      <p className="text-[11px] font-body font-normal text-[rgba(0,0,0,0.65)]">
                        {formatArticleDate(articlesMap[item.slug]?.date)}
                      </p>
                      <h3 className="text-[18px] font-body font-bold leading-[1.35] tracking-[-0.02em] text-[#181818] transition-colors duration-300 group-hover:text-[#CE2127]">
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                  <div>
                    <p className="mt-3 text-[12px] font-body font-normal leading-[1.6] text-[rgba(0,0,0,0.65)]">
                      {item.summary}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {hasMoreArticles && !showAllArticles ? (
              <div className="mt-16 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllArticles(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#CE2127] px-7 py-3 text-[13px] font-body font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Discover more
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
