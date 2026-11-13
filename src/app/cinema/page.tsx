"use client";
import { useEffect, useState } from "react";
import type { CinemaFeed } from "@/lib/cinema-feed-data";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter";
import { formatReleaseDate } from "@/lib/upcoming";
import { formatArticleDate, hasArticleCategory } from "@/lib/articles";
import { usePublicArticles } from "@/lib/use-public-articles";
import { useUpcomingSettings } from "@/lib/use-upcoming-settings";

const RELEASE_CARD_WIDTH = 218;
const RELEASE_CARD_GAP = 14;

export default function CinemaPage() {
  const pathname = usePathname();
  const { sortedCards, articlesMap } = usePublicArticles();
  const upcomingSettings = useUpcomingSettings();
  const cinemaArticles = sortedCards.filter((article) =>
    hasArticleCategory(article, "cinema")
  );
  const [feed, setFeed] = useState<CinemaFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"now" | "upcoming">("now");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/cinema-feed", { cache: "no-store", signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Cinema feed unavailable"); return response.json(); })
      .then((value: CinemaFeed) => { if (!controller.signal.aborted && Array.isArray(value.movies)) setFeed(value); })
      .catch(() => { /* The page shows a source link if listings are unavailable. */ })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  const releases = tab === "now" ? feed?.movies ?? [] : upcomingSettings.cinema;
  const releaseLoopWidth = (RELEASE_CARD_WIDTH + RELEASE_CARD_GAP) * releases.length;
  const loopedReleases = [...releases, ...releases, ...releases];

  return (
    <div key={pathname} className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <section className="mx-auto max-w-[1116px] px-4 py-16 md:px-6 md:py-18">
          <div>
            <h2 className="text-[25px] font-body font-bold tracking-[-0.03em] text-[#181818]">
              {tab === "now" ? "Now showing in Morocco" : "Upcoming Releases"}
            </h2>
            <div className="mt-4 flex gap-3">
              {(["now", "upcoming"] as const).map((value) => <button key={value} type="button" aria-pressed={tab === value} onClick={() => setTab(value)} className={`rounded-full border px-4 py-2 text-sm font-body font-semibold ${tab === value ? "border-[#CE2127] bg-[#CE2127] text-white" : "border-black/15 text-black/65"}`}>{value === "now" ? "Now showing" : "Upcoming"}</button>)}
            </div>
            {tab === "now" ? <p className="mt-3 text-xs font-body text-black/55">Megarama listings{feed?.sources.length ? ` · ${feed.sources.join(" · ")}` : " · Casablanca, Rabat & Marrakech"}. Availability varies by cinema. Select a poster for showtimes.</p> : null}
            {tab === "now" && feed?.syncedAt ? <p className="mt-1 text-[11px] font-body text-black/45">Updated {new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Casablanca" }).format(new Date(feed.syncedAt))}</p> : null}
          </div>

          {tab === "now" && !releases.length ? <div className="mt-8 rounded-lg bg-[#faf8f6] p-6 text-sm font-body text-black/60" role="status">
            {loading ? "Loading current cinema listings…" : <>Current listings are temporarily unavailable. <a href="https://casablanca.megarama.ma/" target="_blank" rel="noreferrer" className="text-[#CE2127] underline">Check Megarama showtimes</a>.</>}
          </div> : null}
          <div className="relative left-1/2 mt-8 w-screen -translate-x-1/2 overflow-hidden py-1">
            <div
              className="upcoming-marquee-track flex gap-[14px] hover:[animation-play-state:paused]"
              style={
                {
                  "--upcoming-offset": "-110px",
                  "--upcoming-shift": `${releaseLoopWidth}px`,
                  "--upcoming-duration": `${Math.max(18, releases.length * 3)}s`,
                } as React.CSSProperties
              }
            >
              {loopedReleases.map((movie, index) => (
                <article key={`${movie.id}-${index}`} className="w-[218px] shrink-0">
                  <div className="h-[306px] overflow-hidden rounded-[8px] bg-[#e8e2db]">
                    {movie.href ? (
                      <a href={movie.href} target={movie.href.startsWith("https://") ? "_blank" : undefined} rel="noreferrer" className="block h-full w-full">
                        <img
                          src={movie.image}
                          alt={movie.title}
                          className="h-full w-full object-cover"
                        />
                      </a>
                    ) : (
                      <img
                        src={movie.image}
                        alt={movie.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="pt-3">
                    <p className="text-[11px] font-body font-semibold text-[rgba(0,0,0,0.48)] uppercase">
                      {formatReleaseDate(movie.releaseDate)}
                    </p>
                    <h3 className="mt-1 text-[14px] font-body font-semibold leading-[1.35] text-[#181818]">
                      {movie.title}
                    </h3>
                    {"cinemas" in movie && Array.isArray(movie.cinemas) ? <p className="mt-1 text-[11px] font-body text-black/55">{movie.cinemas.join(" · ")}</p> : null}
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
                href="/cinema/articles"
                className="inline-flex items-center gap-2 text-[16px] font-body font-semibold text-[#CE2127] transition-opacity hover:opacity-75"
              >
                Discover more
                <ArrowRight size={16} strokeWidth={2.2} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-x-[28px] gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {cinemaArticles.map((article) => (
                <article key={article.slug} className="max-w-[321px]">
                  <Link
                    href={`/articles/${article.slug}`}
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
