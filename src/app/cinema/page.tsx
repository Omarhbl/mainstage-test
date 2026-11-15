import CinemaPage from "@/components/pages/CinemaPage";
import { getPublicListingArticles } from "@/lib/public-articles";
import { getCinemaFeed } from "@/lib/cinema-feed";
import { getUpcomingSettings } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [initialArticles, initialFeed, initialUpcoming] = await Promise.all([getPublicListingArticles("cinema"), getCinemaFeed(), getUpcomingSettings()]);
  return <CinemaPage initialArticles={initialArticles} initialFeed={initialFeed} initialUpcoming={initialUpcoming} />;
}
