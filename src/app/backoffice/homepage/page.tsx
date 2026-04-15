import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import SectionCard from "@/components/backoffice/SectionCard";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";

export default async function BackofficeHomepagePage() {
  await requireBackofficeAccess(["admin", "editor"]);

  return (
    <div className="space-y-8">
      <BackofficeHeader
        title="Homepage"
        subtitle="Choose which homepage block you want to update. Each card opens its own editor so the team can focus on one thing at a time."
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard
          title="Homepage slider"
          description="Update the main hero title, label, destination, and media shown at the top of the homepage."
          href="/backoffice/homepage/hero"
        />
        <SectionCard
          title="Must-Read"
          description="Choose which article should be highlighted in the Must-Read block on the homepage."
          href="/backoffice/homepage/must-read"
        />
        <SectionCard
          title="Banner ad"
          description="Edit the homepage banner image and the link it should open when someone clicks on it."
          href="/backoffice/homepage/banner"
        />
        <SectionCard
          title="Social Highlights"
          description="Manage the social strip visuals and destinations shown between the homepage sections."
          href="/backoffice/homepage/social"
        />
        <SectionCard
          title="Red band"
          description="Choose the article headlines that rotate in the red ticker band across the top of the website."
          href="/backoffice/homepage/ticker"
        />
        <SectionCard
          title="Feed refresh"
          description="Check YouTube and Spotify sync timing and trigger a manual refresh if the team needs it."
          href="/backoffice/homepage/feeds"
        />
      </div>
    </div>
  );
}
