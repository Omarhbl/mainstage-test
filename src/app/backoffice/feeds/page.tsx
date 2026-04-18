import Link from "next/link";
import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import StatCard from "@/components/backoffice/StatCard";
import {
  refreshSpotifyFeedAction,
  refreshYoutubeFeedAction,
} from "@/app/backoffice/homepage/actions";
import {
  getSpotifyFeedHealth,
  getYoutubeFeedHealth,
} from "@/lib/feed-monitor";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { getFeedSettings, getUpcomingSettings } from "@/lib/supabase/server";

export default async function BackofficeFeedsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  await requireBackofficeAccess(["admin", "editor"]);
  const { notice, type } = await searchParams;
  const upcomingSettings = await getUpcomingSettings();
  const feedSettings = await getFeedSettings();
  const spotifyHealth = await getSpotifyFeedHealth();
  const youtubeHealth = await getYoutubeFeedHealth();

  const topSpotifyTrack = feedSettings.spotify.tracks.slice(0, 10)[0];
  const topYoutubeVideo = feedSettings.youtube.videos[0];

  return (
    <div className="space-y-8">
      <BackofficeHeader
        title="Feeds"
        subtitle="Monitor the live sources powering music charts and trending videos, then refresh them from one place when the team needs an immediate update."
      />

      {notice ? (
        <div
          className={`rounded-[16px] border px-4 py-3 text-[14px] font-body leading-[1.7] ${
            type === "success"
              ? "border-[#0f8b4c]/15 bg-[#0f8b4c]/6 text-[#0f8b4c]"
              : "border-[#CE2127]/15 bg-[#CE2127]/6 text-[#9f1b20]"
          }`}
        >
          {notice}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Spotify Sync"
          value={spotifyHealth.value}
          hint={spotifyHealth.hint}
        />
        <StatCard
          label="YouTube Sync"
          value={youtubeHealth.value}
          hint={youtubeHealth.hint}
        />
        <StatCard
          label="Cinema strip"
          value={String(upcomingSettings.cinema.length).padStart(2, "0")}
          hint="Manual upcoming release slots currently active."
        />
        <StatCard
          label="Events strip"
          value={String(upcomingSettings.entertainment.length).padStart(2, "0")}
          hint="Manual events slots currently active."
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="space-y-5">
          <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
              Feed refresh
            </p>
            <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
              Refresh live feeds
            </h2>
            <p className="mt-3 text-[14px] font-body leading-[1.75] text-black/60">
              The feeds should already refresh every hour. Use these controls whenever the team wants to force a fresh update right away.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-5">
                <p className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-black/45">
                  YouTube Morocco
                </p>
                <p className="mt-3 text-[15px] font-body leading-[1.7] text-black/60">
                  Latest sync: {youtubeHealth.syncedAtLabel}
                </p>
                <p className="mt-1 text-[13px] font-body leading-[1.7] text-black/50">
                  Next automatic refresh: {youtubeHealth.nextRefreshLabel}
                </p>
                <form action={refreshYoutubeFeedAction} className="mt-4">
                  <input type="hidden" name="redirect_target" value="feeds" />
                  <button
                    type="submit"
                    className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-black/10 bg-white px-4 text-[14px] font-body font-semibold text-[#181818] transition-colors hover:border-[#CE2127] hover:text-[#CE2127]"
                  >
                    Refresh YouTube
                  </button>
                </form>
              </div>

              <div className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-5">
                <p className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-black/45">
                  Spotify Morocco
                </p>
                <p className="mt-3 text-[15px] font-body leading-[1.7] text-black/60">
                  Latest sync: {spotifyHealth.syncedAtLabel}
                </p>
                <p className="mt-1 text-[13px] font-body leading-[1.7] text-black/50">
                  Next automatic refresh: {spotifyHealth.nextRefreshLabel}
                </p>
                <form action={refreshSpotifyFeedAction} className="mt-4">
                  <input type="hidden" name="redirect_target" value="feeds" />
                  <button
                    type="submit"
                    className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-black/10 bg-white px-4 text-[14px] font-body font-semibold text-[#181818] transition-colors hover:border-[#CE2127] hover:text-[#CE2127]"
                  >
                    Refresh Spotify
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                  What feeds power
                </p>
                <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                  Current live usage
                </h2>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {[
                ["Spotify", "Drives the homepage On Repeat block and the music chart pages."],
                ["YouTube", "Drives the Trending Now in Morocco video list on the homepage."],
                ["Upcoming", "Cinema and events strips remain manually curated by the editorial team."],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-5"
                >
                  <h3 className="text-[16px] font-body font-bold text-[#181818]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[14px] font-body leading-[1.75] text-black/60">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
              Spotify snapshot
            </p>
            <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
              Top track right now
            </h2>

            {topSpotifyTrack ? (
              <div className="mt-5 rounded-[16px] border border-black/8 bg-[#faf8f6] p-4">
                <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-4">
                  <img
                    src={topSpotifyTrack.image}
                    alt={topSpotifyTrack.title}
                    className="h-[72px] w-[72px] rounded-[12px] object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-[12px] font-body font-semibold uppercase tracking-[0.12em] text-black/45">
                      {topSpotifyTrack.rank}
                    </p>
                    <h3 className="mt-1 truncate text-[18px] font-body font-bold text-[#181818]">
                      {topSpotifyTrack.title}
                    </h3>
                    <p className="mt-1 truncate text-[14px] font-body text-black/60">
                      {topSpotifyTrack.artist}
                    </p>
                    <p className="mt-3 text-[13px] font-body text-black/55">
                      Plays: {topSpotifyTrack.plays?.toLocaleString() ?? "Not available yet"}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
              YouTube snapshot
            </p>
            <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
              Top video right now
            </h2>

            {topYoutubeVideo ? (
              <div className="mt-5 rounded-[16px] border border-black/8 bg-[#faf8f6] p-4">
                <img
                  src={topYoutubeVideo.image}
                  alt={topYoutubeVideo.title}
                  className="h-[180px] w-full rounded-[12px] object-cover"
                />
                <h3 className="mt-4 text-[18px] font-body font-bold leading-[1.4] text-[#181818]">
                  {topYoutubeVideo.title}
                </h3>
                <p className="mt-2 text-[14px] font-body text-black/60">
                  {topYoutubeVideo.channel}
                </p>
                <p className="mt-1 text-[13px] font-body text-black/55">
                  Published: {new Intl.DateTimeFormat("en-GB").format(new Date(topYoutubeVideo.publishedAt))}
                </p>
              </div>
            ) : null}
          </div>

          <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
              Quick links
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3">
              {[
                ["/music", "Open Music page"],
                ["/music/top-50", "Open Spotify Top 50 page"],
                ["/backoffice/upcoming", "Open Upcoming section"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-[14px] border border-black/8 bg-[#faf8f6] px-4 py-3 text-[14px] font-body font-semibold text-[#181818] transition-colors hover:bg-[#f1ede8]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
