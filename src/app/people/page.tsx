import PeoplePage from "@/components/pages/PeoplePage";
import { getPublicListingArticles } from "@/lib/public-articles";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initialArticles = await getPublicListingArticles("people");
  return <PeoplePage initialArticles={initialArticles} />;
}
