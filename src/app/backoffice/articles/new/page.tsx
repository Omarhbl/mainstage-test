import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import ArticleEditorForm from "@/components/backoffice/ArticleEditorForm";
import { createArticleAction } from "@/app/backoffice/articles/actions";

export default async function NewBackofficeArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { notice, type } = await searchParams;

  return (
    <div className="space-y-8">
      <BackofficeHeader
        title="New article"
        subtitle="Create a new story, assign the right category, and prepare everything your team needs before publishing."
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

      <ArticleEditorForm
        action={createArticleAction}
        submitLabel="Save article"
        mode="new"
      />
    </div>
  );
}
