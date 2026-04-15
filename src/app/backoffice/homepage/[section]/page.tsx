import { notFound } from "next/navigation";
import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import HomepageSectionEditor from "@/components/backoffice/HomepageSectionEditor";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { getSortedPublicArticleCards } from "@/lib/public-articles";
import { getHomepageSettings } from "@/lib/supabase/server";
import { SPOTIFY_MOROCCO_SYNCED_AT } from "@/lib/spotify";
import { YOUTUBE_MOROCCO_SYNCED_AT } from "@/lib/youtube";

const HOMEPAGE_SECTIONS = {
  hero: {
    title: "Homepage slider",
    subtitle: "Update the hero content shown at the top of the homepage.",
  },
  "must-read": {
    title: "Must-Read",
    subtitle: "Choose which article should be featured in the Must-Read block.",
  },
  banner: {
    title: "Banner ad",
    subtitle: "Manage the homepage banner visual and its destination link.",
  },
  social: {
    title: "Social Highlights",
    subtitle: "Edit the social strip visuals and destination links.",
  },
  ticker: {
    title: "Red band",
    subtitle: "Choose and arrange the headlines that rotate in the red ticker band.",
  },
  feeds: {
    title: "Feed refresh",
    subtitle: "Monitor YouTube and Spotify refresh timing and force a sync when needed.",
  },
} as const;

type HomepageSectionKey = keyof typeof HOMEPAGE_SECTIONS;

export default async function BackofficeHomepageSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  await requireBackofficeAccess(["admin", "editor"]);
  const { section } = await params;
  const { notice, type } = await searchParams;

  if (!(section in HOMEPAGE_SECTIONS)) {
    notFound();
  }

  const sectionKey = section as HomepageSectionKey;
  const config = HOMEPAGE_SECTIONS[sectionKey];
  const homepageSettings = await getHomepageSettings();
  const articleOptions = await getSortedPublicArticleCards();
  const spotifySyncedAt = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(SPOTIFY_MOROCCO_SYNCED_AT));
  const youtubeSyncedAt = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(YOUTUBE_MOROCCO_SYNCED_AT));

  return (
    <div className="space-y-8">
      <BackofficeHeader title={config.title} subtitle={config.subtitle} />

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

      <HomepageSectionEditor
        section={sectionKey}
        homepageSettings={homepageSettings}
        articleOptions={articleOptions}
        spotifySyncedAt={spotifySyncedAt}
        youtubeSyncedAt={youtubeSyncedAt}
      />
    </div>
  );
}
