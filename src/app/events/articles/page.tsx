import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter";
import { formatArticleDate, hasArticleCategory } from "@/lib/articles";
import {
  getPublicArticlesBySlug,
  getSortedPublicArticleCards,
} from "@/lib/public-articles";

export const dynamic = "force-dynamic";

export default async function EventsArticlesPage() {
  const eventArticles = (await getSortedPublicArticleCards()).filter((article) =>
    hasArticleCategory(article, "events")
  );
  const articlesBySlug = await getPublicArticlesBySlug();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <section className="mx-auto max-w-[1116px] px-4 py-16 md:px-6 md:py-18">
          <div className="flex flex-col gap-6">
            <Link
              href="/events"
              className="inline-flex w-fit items-center gap-2 text-[15px] font-body font-medium text-[rgba(0,0,0,0.62)] transition-colors hover:text-[#181818]"
            >
              <ArrowLeft size={16} />
              Back to Events
            </Link>

            <div className="space-y-3">
              <h1 className="text-[34px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                All Events Articles
              </h1>
              <p className="max-w-[980px] whitespace-nowrap text-[18px] font-body font-normal leading-[1.65] text-[rgba(0,0,0,0.68)]">
                Explore every event story published on Mainstage, from live moments to the releases and personalities driving the spotlight.
              </p>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-x-[28px] gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {eventArticles.map((article) => (
              <article key={article.slug} className="max-w-[321px]">
                <Link href={`/articles/${article.slug}?from=events`} className="block">
                  <div className="h-[191px] w-full overflow-hidden rounded-[8px] bg-[#e7e1db]">
                    <img
                      src={article.image}
                      alt={article.title}
                      className={`h-full w-full object-cover ${article.imageClassName ?? ""}`}
                    />
                  </div>

                  <div className="pt-4">
                    <p className="text-[11px] font-body font-normal text-[rgba(0,0,0,0.65)]">
                      {formatArticleDate(articlesBySlug[article.slug]?.date)}
                    </p>
                    <h2 className="text-[18px] font-body font-bold leading-[1.35] tracking-[-0.02em] text-[#181818]">
                      {article.title}
                    </h2>
                  </div>
                </Link>

                <div>
                  <p className="mt-3 text-[12px] font-body font-normal leading-[1.6] text-[rgba(0,0,0,0.65)]">
                    {article.summary}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
