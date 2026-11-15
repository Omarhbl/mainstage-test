import EventsPage from "@/components/pages/EventsPage";
import { getPublicListingArticles } from "@/lib/public-articles";
import { getEventFeed } from "@/lib/event-feed";
import { getUpcomingSettings } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [initialArticles, initialFeed, initialUpcoming] = await Promise.all([getPublicListingArticles("events"), getEventFeed(), getUpcomingSettings()]);
  return <EventsPage initialArticles={initialArticles} initialFeed={initialFeed} initialUpcoming={initialUpcoming} />;
}
