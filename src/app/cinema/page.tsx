"use client";
import { useEffect, useRef, useState } from "react";
import type { CinemaFeed } from "@/lib/cinema-feed-data";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter";
import { formatReleaseDate } from "@/lib/upcoming";
import { formatArticleDate, hasArticleCategory, getArticleImageStyle } from "@/lib/articles";
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
      .catch(() => { /* The page shows an unavailable message if listings cannot be loaded. */ })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  const releases = tab === "now" ? feed?.movies ?? [] : feed?.upcoming?.length ? feed.upcoming : upcomingSettings.cinema.filter((movie) => movie.releaseDate >= new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Casablanca", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()));
  const releaseLoopWidth = (RELEASE_CARD_WIDTH + RELEASE_CARD_GAP) * releases.length;
  const animateReleases = releases.length > 5;
  const loopedReleases = animateReleases ? [...releases, ...releases, ...releases] : releases;
  const movieTrack = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ pointerId: number; x: number; time: number } | null>(null);
  const duration = Math.max(18, releases.length * 3) * 1000;
  function seekMovies(time: number) {
    const animation = movieTrack.current?.getAnimations()[0];
    if (animation) animation.currentTime = ((time % duration) + duration) % duration;
  }
  function stepMovies(direction: number) {
    const animation = movieTrack.current?.getAnimations()[0];
    if (animation && releaseLoopWidth) seekMovies(Number(animation.currentTime ?? 0) + direction * (RELEASE_CARD_WIDTH + RELEASE_CARD_GAP) * duration / releaseLoopWidth);
  }
  function startMovieDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!animateReleases || (event.pointerType === "mouse" && event.button !== 0)) return;
    const animation = movieTrack.current?.getAnimations()[0];
    if (!animation) return;
    animation.pause();
    gesture.current = { pointerId: event.pointerId, x: event.clientX, time: Number(animation.currentTime ?? 0) };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function endMovieDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (gesture.current?.pointerId !== event.pointerId) return;
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    movieTrack.current?.getAnimations()[0]?.play();
  }


  return (
    <div key={pathname} className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <section className="mx-auto max-w-[1116px] px-4 py-16 md:px-6 md:py-18">
          <div>
            <h2 className="text-[25px] font-body font-bold tracking-[-0.03em] text-[#181818]">
              {tab === "now" ? "Now showing in Morocco" : "Upcoming Releases"}
            </h2>
            <div className="mt-4 flex items-center gap-3">
              {(["now", "upcoming"] as const).map((value) => <button key={value} type="button" aria-pressed={tab === value} onClick={() => setTab(value)} className={`rounded-full border px-4 py-2 text-sm font-body font-semibold ${tab === value ? "border-[#CE2127] bg-[#CE2127] text-white" : "border-black/15 text-black/65"}`}>{value === "now" ? "Now showing" : "Upcoming"}</button>)}
              {animateReleases ? <div className="ml-auto flex gap-2">
                <button type="button" aria-label="Previous movies" onClick={() => stepMovies(-1)} className="rounded-full border border-black/15 p-2 text-black/65 hover:bg-black/5"><ChevronLeft size={20} /></button>
                <button type="button" aria-label="Next movies" onClick={() => stepMovies(1)} className="rounded-full border border-black/15 p-2 text-black/65 hover:bg-black/5"><ChevronRight size={20} /></button>
              </div> : null}
            </div>
          </div>

          {!releases.length ? <div className="mt-8 rounded-lg bg-[#faf8f6] p-6 text-sm font-body text-black/60" role="status">
            {loading ? "Loading cinema listings…" : tab === "now" ? "Current listings are temporarily unavailable." : "Upcoming releases are temporarily unavailable. Please check again shortly."}
          </div> : null}
          <div className={animateReleases ? "relative left-1/2 mt-8 w-screen -translate-x-1/2 overflow-hidden py-1" : "mt-8 py-1"}>
            <div
              ref={movieTrack}
              onPointerDown={startMovieDrag}
              onPointerMove={(event) => { const drag = gesture.current; if (drag?.pointerId === event.pointerId && releaseLoopWidth) seekMovies(drag.time + (drag.x - event.clientX) * duration / releaseLoopWidth); }}
              onPointerUp={endMovieDrag}
              onPointerCancel={endMovieDrag}
              onLostPointerCapture={endMovieDrag}
              onPointerEnter={(event) => { if (event.pointerType === "mouse") movieTrack.current?.getAnimations()[0]?.pause(); }}
              onPointerLeave={() => { if (!gesture.current) movieTrack.current?.getAnimations()[0]?.play(); }}
              className={animateReleases ? "upcoming-marquee-track flex cursor-grab select-none gap-[14px] active:cursor-grabbing" : "flex flex-wrap justify-center gap-x-[14px] gap-y-6"}
              style={
                {
                  touchAction: animateReleases ? "pan-y" : undefined,
                  "--upcoming-offset": "-110px",
                  "--upcoming-shift": `${releaseLoopWidth}px`,
                  "--upcoming-duration": `${Math.max(18, releases.length * 3)}s`,
                } as React.CSSProperties
              }
            >
              {loopedReleases.map((movie, index) => (
                <article key={`${movie.id}-${index}`} className="w-[218px] shrink-0">
                  <div className="h-[306px] overflow-hidden rounded-[8px] bg-[#e8e2db]">
                    <img draggable={false} src={movie.image} alt={movie.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="pt-3">
                    <p className="text-[11px] font-body font-semibold text-[rgba(0,0,0,0.48)] uppercase">
                      {formatReleaseDate(movie.releaseDate)}
                    </p>
                    <h3 className="mt-1 text-[14px] font-body font-semibold leading-[1.35] text-[#181818]">
                      {movie.title}
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
