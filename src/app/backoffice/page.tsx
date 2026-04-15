import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import SectionCard from "@/components/backoffice/SectionCard";
import StatCard from "@/components/backoffice/StatCard";
import {
  getSpotifyFeedHealth,
  getYoutubeFeedHealth,
} from "@/lib/feed-monitor";
import {
  createSupabaseAdminClient,
  getDashboardEditorialNote,
} from "@/lib/supabase/server";

export default async function BackofficeDashboardPage() {
  const adminClient = createSupabaseAdminClient();
  const articleCountResponse = adminClient
    ? await adminClient
        .from("backoffice_articles")
        .select("*", { count: "exact", head: true })
    : null;
  const totalArticles = articleCountResponse?.count ?? 0;
  const editorialNote = await getDashboardEditorialNote();
  const spotifyHealth = getSpotifyFeedHealth();
  const youtubeHealth = getYoutubeFeedHealth();

  return (
    <div className="space-y-8">
      <BackofficeHeader
        title="Dashboard"
        subtitle="A newsroom view of what matters right now: publishing, homepage curation, asset management, and feed health."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Articles"
          value={String(totalArticles).padStart(2, "0")}
          hint="Stories currently available across the platform."
        />
        <StatCard
          label="Website visits"
          value="--"
          hint="Website traffic overview."
        />
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
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <SectionCard
            title="Articles"
            description="Create, edit, review, and publish newsroom content without touching code."
            href="/backoffice/articles"
          />
          <SectionCard
            title="Homepage"
            description="Choose featured stories, adjust the Must-Read placement, and manage homepage promotion blocks."
            href="/backoffice/homepage"
          />
          <SectionCard
            title="Upcoming"
            description="Maintain the upcoming releases and events strips for cinema and events."
            href="/backoffice/upcoming"
          />
          <SectionCard
            title="Feeds"
            description="Keep an eye on Spotify and YouTube updates that power the site."
            href="/backoffice/feeds"
          />
        </div>

        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Editorial note
          </p>
          <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            {editorialNote.title}
          </h2>
          <p className="mt-4 text-[15px] font-body font-normal leading-[1.8] text-black/62">
            {editorialNote.message}
          </p>
          <div className="mt-6 rounded-[14px] border border-black/8 bg-[#faf8f6] px-4 py-3">
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.12em] text-black/45">
              Updated
            </p>
            <p className="mt-1 text-[14px] font-body font-medium text-[#181818]">
              {editorialNote.updatedAt}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-black/45">
              Workflow
            </p>
            <h2 className="mt-2 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
              How we work together
            </h2>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
          {[
            ["1", "Writers draft", "Create a story, add title, recap, body, hero media, and bottom media."],
            ["2", "Editors review", "Check category placement, homepage relevance, and publishing readiness."],
            ["3", "Homepage team curates", "Choose the Must-Read, update ads, and keep key placements aligned."],
            ["4", "Operations monitor feeds", "Track YouTube, Spotify, and upcoming manual strips from one place."],
          ].map(([step, title, text]) => (
            <div
              key={title}
              className="rounded-[18px] border border-black/8 bg-[#faf8f6] p-5"
            >
              <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#CE2127] text-[13px] font-body font-bold text-white">
                {step}
              </span>
              <h3 className="mt-4 text-[18px] font-body font-bold tracking-[-0.03em] text-[#181818]">
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
  );
}
