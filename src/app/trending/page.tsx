import TrendingPage from "@/components/pages/TrendingPage";
import { getPublicListingArticles } from "@/lib/public-articles";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initialArticles = await getPublicListingArticles();
  return <TrendingPage initialArticles={initialArticles} />;
}
