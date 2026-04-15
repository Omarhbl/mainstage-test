import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter";
import { formatArticleDate, getDisplayCategoryLabel } from "@/lib/articles";
import { searchPublicArticles } from "@/lib/public-articles";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = await searchPublicArticles(query);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <section className="mx-auto max-w-[1116px] px-4 py-16 md:px-6 md:py-20">
          <div className="space-y-4">
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.22em] text-[#CE2127]">
              Search
            </p>
            <h1 className="text-[34px] font-body font-bold tracking-[-0.04em] text-[#181818]">
              {query ? `Results for “${query}”` : "Search the site"}
            </h1>
            <p className="max-w-[760px] text-[16px] font-body font-normal leading-[1.7] text-[rgba(0,0,0,0.68)]">
              Find articles, stories, and categories across Mainstage.
            </p>
          </div>

          {!query ? (
            <div className="mt-12 rounded-[12px] border border-black/10 bg-[#faf7f2] px-6 py-8 text-[16px] font-body text-[rgba(0,0,0,0.62)]">
              Use the search bar in the header to look for an article, artist, category, or keyword.
            </div>
          ) : results.length === 0 ? (
            <div className="mt-12 rounded-[12px] border border-black/10 bg-[#faf7f2] px-6 py-8 text-[16px] font-body text-[rgba(0,0,0,0.62)]">
              No results found for <span className="font-semibold text-[#181818]">{query}</span>.
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-x-[28px] gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((article) => (
                <article key={article.slug} className="max-w-[321px]">
                  <Link
                    href={`/articles/${article.slug}?from=${article.category.toLowerCase()}`}
                    className="block"
                  >
                    <div className="h-[191px] w-full overflow-hidden rounded-[8px] bg-[#e7e1db]">
                      <img
                        src={article.image}
                        alt={article.title}
                        className={`h-full w-full object-cover ${article.imageClassName ?? ""}`}
                      />
                    </div>

                    <div className="pt-4">
                      <p className="text-[11px] font-body font-normal text-[rgba(0,0,0,0.62)]">
                        {formatArticleDate(article.date)}
                      </p>
                      <h2 className="mt-2 text-[18px] font-body font-bold leading-[1.35] tracking-[-0.02em] text-[#181818]">
                        {article.title}
                      </h2>
                    </div>
                  </Link>

                  <p className="mt-3 text-[12px] font-body font-normal leading-[1.6] text-[rgba(0,0,0,0.65)]">
                    {article.summary}
                  </p>
                  <p className="mt-3 text-[10px] font-body font-semibold text-[#CE2127]">
                    {getDisplayCategoryLabel(article.category)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
