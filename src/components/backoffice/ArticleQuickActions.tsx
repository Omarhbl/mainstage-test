"use client";

import {
  deleteArticleQuickAction,
  publishArticleQuickAction,
  unpublishArticleQuickAction,
} from "@/app/backoffice/articles/actions";

type ArticleQuickActionsProps = {
  articleId: string;
  articleTitle: string;
  status: string;
};

export default function ArticleQuickActions({
  articleId,
  articleTitle,
  status,
}: ArticleQuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "published" ? (
        <form action={publishArticleQuickAction}>
          <input type="hidden" name="id" value={articleId} />
          <button
            type="submit"
            className="inline-flex h-[34px] items-center justify-center rounded-[10px] bg-[#0f8b4c] px-3 text-[12px] font-body font-semibold text-white transition-opacity hover:opacity-90"
          >
            Publish
          </button>
        </form>
      ) : (
        <form action={unpublishArticleQuickAction}>
          <input type="hidden" name="id" value={articleId} />
          <button
            type="submit"
            className="inline-flex h-[34px] items-center justify-center rounded-[10px] border border-black/10 bg-white px-3 text-[12px] font-body font-semibold text-[#181818] transition-colors hover:border-[#CE2127] hover:text-[#CE2127]"
          >
            Unpublish
          </button>
        </form>
      )}

      <form action={deleteArticleQuickAction}>
        <input type="hidden" name="id" value={articleId} />
        <button
          type="submit"
          onClick={(event) => {
            const confirmed = window.confirm(
              `Delete "${articleTitle}"? This action cannot be undone.`
            );

            if (!confirmed) {
              event.preventDefault();
            }
          }}
          className="inline-flex h-[34px] items-center justify-center rounded-[10px] border border-[#CE2127]/20 bg-[#CE2127]/8 px-3 text-[12px] font-body font-semibold text-[#CE2127] transition-opacity hover:opacity-85"
        >
          Delete
        </button>
      </form>
    </div>
  );
}
