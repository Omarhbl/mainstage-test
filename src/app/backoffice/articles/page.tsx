import Link from "next/link";
import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import ArticleQuickActions from "@/components/backoffice/ArticleQuickActions";
import { formatArticleDate } from "@/lib/articles";
import {
  BACKOFFICE_ARTICLE_CATEGORIES,
  getBackofficeArticles,
  getBackofficeCategoryLabel,
} from "@/lib/backoffice-articles";

function getStatusClassName(status: string) {
  switch (status) {
    case "published":
      return "text-[#0f8b4c]";
    case "review":
      return "text-[#CE2127]";
    case "draft":
    default:
      return "text-[#181818]";
  }
}

function getPublisherName(value?: string | null) {
  if (value && value.trim()) {
    return value.trim();
  }

  return "Not assigned";
}

export default async function BackofficeArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{
    notice?: string;
    type?: string;
    query?: string;
    category?: string;
  }>;
}) {
  const { notice, type, query, category } = await searchParams;
  const articleRows = await getBackofficeArticles();
  const normalizedQuery = query?.trim().toLowerCase() ?? "";
  const normalizedCategory = category?.trim().toLowerCase() ?? "";
  const filteredRows = articleRows.filter((article) => {
    const matchesQuery =
      !normalizedQuery ||
      article.title.toLowerCase().includes(normalizedQuery) ||
      article.slug.toLowerCase().includes(normalizedQuery);

    const matchesCategory =
      !normalizedCategory ||
      article.primary_category.toLowerCase() === normalizedCategory;

    return matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <BackofficeHeader
        title="Articles"
        subtitle="Review the latest stories, open any article for updates, and keep the editorial flow moving."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/backoffice/articles/new"
              className="inline-flex h-[46px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
            >
              New article
            </Link>
          </div>
        }
      />

      {notice ? (
        <div
          className={`rounded-[16px] border px-4 py-3 text-[14px] font-body leading-[1.7] ${
            type === "success"
              ? "border-[#0f8b4c]/15 bg-[#0f8b4c]/6 text-[#0f8b4c]"
              : "border-[#CE2127]/15 bg-[#CE2127]/6 text-[#9f1b20]"
          }`}
        >
          {notice}
        </div>
      ) : null}

      <div className="rounded-[20px] border border-black/8 bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
        <div className="mb-4">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-[#CE2127]">
            Search and filter
          </p>
          <h2 className="mt-2 text-[22px] font-body font-bold tracking-[-0.03em] text-[#181818]">
            Find the article you want to edit
          </h2>
        </div>

        <form className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end">
          <div className="space-y-2">
            <label
              htmlFor="article-query"
              className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-black/45"
            >
              Search article
            </label>
            <input
              id="article-query"
              name="query"
              defaultValue={query ?? ""}
              placeholder="Search by title or slug"
              className="h-[48px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] font-body text-[#181818] outline-none transition-colors placeholder:text-black/35 focus:border-[#CE2127]"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="article-category"
              className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-black/45"
            >
              Filter by category
            </label>
            <select
              id="article-category"
              name="category"
              defaultValue={category ?? ""}
              className="h-[48px] w-full rounded-[12px] border border-black/10 bg-white px-4 text-[15px] font-body text-[#181818] outline-none transition-colors focus:border-[#CE2127]"
            >
              <option value="">All categories</option>
              {BACKOFFICE_ARTICLE_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {getBackofficeCategoryLabel(item)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
            >
              Apply filters
            </button>
            <Link
              href="/backoffice/articles"
              className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-black/10 bg-white px-5 text-[14px] font-body font-semibold text-[#181818] transition-colors hover:bg-[#f3efea]"
            >
              Reset
            </Link>
          </div>
        </form>

        <p className="mt-4 text-[13px] font-body leading-[1.7] text-black/55">
          Showing {filteredRows.length} article{filteredRows.length === 1 ? "" : "s"}
          {normalizedQuery ? ` for "${query}"` : ""}
          {normalizedCategory ? ` in ${getBackofficeCategoryLabel(category ?? "")}` : ""}.
        </p>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-black/8 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-[minmax(0,1.15fr)_140px_140px_160px_120px_220px] gap-4 border-b border-black/8 px-6 py-4 text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-black/45">
          <span>Title</span>
          <span>Section</span>
          <span>Date</span>
          <span>Published by</span>
          <span>Status</span>
          <span>Quick actions</span>
        </div>

        <div>
          {filteredRows.length > 0 ? (
            filteredRows.map((article) => (
              <div
                key={article.id}
                className="grid grid-cols-[minmax(0,1.15fr)_140px_140px_160px_120px_220px] gap-4 border-b border-black/6 px-6 py-4 transition-colors hover:bg-black/[0.02]"
              >
                <Link
                  href={`/backoffice/articles/${article.id}`}
                  className="truncate text-[15px] font-body font-medium text-[#181818] transition-colors hover:text-[#CE2127]"
                >
                  {article.title}
                </Link>
                <span className="text-[14px] font-body font-normal text-black/65">
                  {getBackofficeCategoryLabel(article.primary_category)}
                </span>
                <span className="text-[14px] font-body font-normal text-black/65">
                  {formatArticleDate(article.date_label)}
                </span>
                <span className="truncate text-[14px] font-body font-normal text-black/65">
                  {getPublisherName(article.published_by_name)}
                </span>
                <span
                  className={`text-[14px] font-body font-semibold ${getStatusClassName(article.status)}`}
                >
                  {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                </span>
                <ArticleQuickActions
                  articleId={article.id}
                  articleTitle={article.title}
                  status={article.status}
                />
              </div>
            ))
          ) : (
            <div className="px-6 py-10 text-[15px] font-body leading-[1.8] text-black/60">
              {articleRows.length > 0 ? (
                <>
                  No articles match the current search or category filter. Try adjusting the filters above.
                </>
              ) : (
                <>
                  No backstage articles yet. Create the first one from
                  <span className="font-semibold text-[#181818]"> New article</span>.
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
