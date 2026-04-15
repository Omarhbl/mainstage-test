import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import SectionCard from "@/components/backoffice/SectionCard";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";

export default async function BackofficeUpcomingPage() {
  await requireBackofficeAccess(["admin", "editor"]);

  return (
    <div className="space-y-8">
      <BackofficeHeader
        title="Upcoming"
        subtitle="Choose which strip you want to update. Each section opens its own editor so the team can manage cinema releases and events separately."
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard
          title="Cinema upcoming releases"
          description="Edit the posters, dates, titles, and destinations shown on the cinema page. Add as many release slots as you need."
          href="/backoffice/upcoming/cinema"
        />
        <SectionCard
          title="Events upcoming list"
          description="Manage the upcoming events strip with your own visuals, dates, titles, and click-through links."
          href="/backoffice/upcoming/events"
        />
      </div>
    </div>
  );
}
