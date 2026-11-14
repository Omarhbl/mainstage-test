"use client";

import { useEffect, useState } from "react";
import EventHighlights from "@/components/events/EventHighlights";
import { eventToday, localDate, mergeTicketEvents, type EventFeed } from "@/lib/event-feed-data";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter";
import { formatArticleDate, hasArticleCategory, getArticleImageStyle } from "@/lib/articles";
import { usePublicArticles } from "@/lib/use-public-articles";
import { useUpcomingSettings } from "@/lib/use-upcoming-settings";


export default function EventsPage() {
  const { sortedCards, articlesMap } = usePublicArticles();
  const upcomingSettings = useUpcomingSettings();
  const [feed, setFeed] = useState<EventFeed | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/event-feed", { cache: "no-store", signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Events unavailable"); return response.json(); })
      .then((value: EventFeed) => { if (!controller.signal.aborted && Array.isArray(value.items)) setFeed(value); })
      .catch(() => { /* Keep the editorial fallback available. */ })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  const manual = upcomingSettings.entertainment.map((item) => ({ ...item, releaseDate: localDate(item.releaseDate) })).filter((item) => item.image && item.releaseDate >= eventToday()).map((item) => ({ ...item, venue: "", city: "", sources: ["editorial"] }));
  const eventHighlights = mergeTicketEvents([...(feed?.items ?? []), ...manual]);
  const eventArticles = sortedCards.filter((article) => hasArticleCategory(article, "events"));

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <section className="mx-auto max-w-[1116px] px-4 py-16 md:px-6 md:py-18">
          <div>
            <h2 className="text-[25px] font-body font-bold tracking-[-0.03em] text-[#181818]">
              Upcoming Events
            </h2>
          </div>

          {!eventHighlights.length ? <p role="status" className="mt-8 text-sm text-black/60">{loading ? "Loading upcoming events…" : "Event listings are temporarily unavailable. Please check again shortly."}</p> : <EventHighlights items={eventHighlights} />}

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
                    href={`/articles/${article.slug}`}
                    className="group block transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="h-[191px] w-full overflow-hidden rounded-[8px] bg-[#e7e1db] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] transition-shadow duration-300 group-hover:shadow-[0_16px_32px_rgba(0,0,0,0.1)]">
                      <img
                        src={article.image}
                        alt={article.title}
                        style={getArticleImageStyle(article)}
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
