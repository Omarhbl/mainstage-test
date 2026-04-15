import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import ArticleEditorForm from "@/components/backoffice/ArticleEditorForm";
import { updateArticleAction } from "@/app/backoffice/articles/actions";
import { getBackofficeArticleById } from "@/lib/backoffice-articles";
import { getArticleImageOverrides } from "@/lib/supabase/server";

export default async function BackofficeArticleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { id } = await params;
  const { notice, type } = await searchParams;
  const article = await getBackofficeArticleById(id);
  const imageOverrides = await getArticleImageOverrides();
  const imageOverride = article ? imageOverrides[article.slug] : undefined;

  return (
    <div className="space-y-8">
      <BackofficeHeader
        title="Edit article"
        subtitle={
          article
            ? `You are editing ${article.title}. Refine the content, media, and publishing status from one place.`
            : `You are editing ${id}. Review the story, refine the content, and keep everything aligned before it goes live.`
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

      {article ? (
        <ArticleEditorForm
          action={updateArticleAction}
          article={article}
          submitLabel="Update article"
          mode="edit"
          imagePositionX={imageOverride?.imagePositionX}
          imagePositionY={imageOverride?.imagePositionY}
        />
      ) : (
        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[15px] font-body font-normal leading-[1.8] text-black/60">
            We couldn’t find this article in the backstage yet. Create it from
            the Articles section first, then come back here to edit it.
          </p>
        </div>
      )}
    </div>
  );
}
