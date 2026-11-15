import SportPage from "@/components/pages/SportPage";
import { getPublicListingArticles } from "@/lib/public-articles";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initialArticles = await getPublicListingArticles("sport");
  return <SportPage initialArticles={initialArticles} />;
}
