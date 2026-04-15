"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter";
import { formatArticleDate, hasArticleCategory } from "@/lib/articles";
import { usePublicArticles } from "@/lib/use-public-articles";
import { useUpcomingSettings } from "@/lib/use-upcoming-settings";

const HIGHLIGHT_CARD_WIDTH = 218;
const HIGHLIGHT_CARD_GAP = 14;

export default function EventsPage() {
  const { sortedCards, articlesMap } = usePublicArticles();
  const upcomingSettings = useUpcomingSettings();
  const eventHighlights = upcomingSettings.entertainment.filter((item) => item.image);
  const eventArticles = sortedCards.filter((article) => hasArticleCategory(article, "events"));
  const highlightLoopWidth =
    (HIGHLIGHT_CARD_WIDTH + HIGHLIGHT_CARD_GAP) * eventHighlights.length;
  const loopedHighlights = [
    ...eventHighlights,
    ...eventHighlights,
    ...eventHighlights,
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <section className="mx-auto max-w-[1116px] px-4 py-16 md:px-6 md:py-18">
          <div>
            <h2 className="text-[25px] font-body font-bold tracking-[-0.03em] text-[#181818]">
              Upcoming Events
            </h2>
          </div>

          <div className="relative left-1/2 mt-8 w-screen -translate-x-1/2 overflow-hidden py-1">
            <div
              className="upcoming-marquee-track flex gap-[14px] hover:[animation-play-state:paused]"
              style={
                {
                  "--upcoming-offset": "-110px",
                  "--upcoming-shift": `${highlightLoopWidth}px`,
                  "--upcoming-duration": "22s",
                } as React.CSSProperties
              }
            >
              {loopedHighlights.map((item, index) => (
                <article key={`${item.id}-${index}`} className="w-[218px] shrink-0">
                  <div className="h-[306px] overflow-hidden rounded-[8px] bg-[#e8e2db]">
                    {item.href ? (
                      <a href={item.href} className="block h-full w-full">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </a>
                    ) : (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="pt-3">
                    <p className="text-[11px] font-body font-semibold text-[rgba(0,0,0,0.48)] uppercase">
                      {formatArticleDate(item.releaseDate)}
                    </p>
                    <h3 className="mt-1 text-[14px] font-body font-semibold leading-[1.35] text-[#181818]">
                      {item.title}
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-20">
            <div className="mb-11 flex items-center justify-between gap-6">
              <h2 className="text-[25px] font-body font-bold tracking-[-0.03em] text-[#181818]">
                What&apos;s new ?
              </h2>

              <Link
                href="/events/articles"
                className="inline-flex items-center gap-2 text-[16px] font-body font-semibold text-[#CE2127] transition-opacity hover:opacity-75"
              >
                Discover more
                <ArrowRight size={16} strokeWidth={2.2} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-x-[28px] gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {eventArticles.map((article) => (
                <article key={article.slug} className="max-w-[321px]">
                  <Link
                    href={`/articles/${article.slug}?from=events`}
                    className="group block transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="h-[191px] w-full overflow-hidden rounded-[8px] bg-[#e7e1db] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] transition-shadow duration-300 group-hover:shadow-[0_16px_32px_rgba(0,0,0,0.1)]">
                      <img
                        src={article.image}
                        alt={article.title}
                        className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${article.imageClassName ?? ""}`}
                      />
                    </div>

                    <div className="pt-4">
                      <p className="text-[11px] font-body font-normal text-[rgba(0,0,0,0.65)]">
                        {formatArticleDate(articlesMap[article.slug]?.date)}
                      </p>
                      <h3 className="text-[18px] font-body font-bold leading-[1.35] tracking-[-0.02em] text-[#181818] transition-colors duration-300 group-hover:text-[#CE2127]">
                        {article.title}
                      </h3>
                    </div>
                  </Link>
                  <div>
                    <p className="mt-3 text-[12px] font-body font-normal leading-[1.6] text-[rgba(0,0,0,0.65)]">
                      {article.summary}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
