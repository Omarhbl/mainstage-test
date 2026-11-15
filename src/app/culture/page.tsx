import CulturePage from "@/components/pages/CulturePage";
import { getPublicListingArticles } from "@/lib/public-articles";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initialArticles = await getPublicListingArticles("culture");
  return <CulturePage initialArticles={initialArticles} />;
}
