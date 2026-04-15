import {
  BACKOFFICE_ARTICLE_CATEGORIES,
  BACKOFFICE_ARTICLE_STATUSES,
  displayDateToInputValue,
  getBackofficeCategoryLabel,
  type BackofficeArticle,
} from "@/lib/backoffice-articles";
import ArticleBodyEditor from "@/components/backoffice/ArticleBodyEditor";

type ArticleEditorFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  article?: BackofficeArticle | null;
  submitLabel: string;
  mode: "new" | "edit";
  imagePositionX?: number;
  imagePositionY?: number;
};

export default function ArticleEditorForm({
  action,
  article,
  submitLabel,
  mode,
  imagePositionX,
  imagePositionY,
}: ArticleEditorFormProps) {
  const secondaryCategories = article?.secondary_categories ?? [];
  const resolvedImagePositionX = typeof imagePositionX === "number" ? imagePositionX : 50;
  const resolvedImagePositionY = typeof imagePositionY === "number" ? imagePositionY : 50;

  return (
    <form action={action} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_340px]">
      {mode === "edit" && article ? (
        <input type="hidden" name="id" value={article.id} />
      ) : null}

      <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-[13px] font-body font-medium text-black/60">
              Title
            </span>
            <input
              name="title"
              defaultValue={article?.title ?? ""}
              className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
              placeholder="Write the article title"
              required
            />
          </label>
          <label className="block">
            <span className="text-[13px] font-body font-medium text-black/60">
              Slug
            </span>
            <input
              name="slug"
              defaultValue={article?.slug ?? ""}
              className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
              placeholder="Leave blank to generate from title"
            />
          </label>
          <label className="block">
            <span className="text-[13px] font-body font-medium text-black/60">
              Main section
            </span>
            <select
              name="primary_category"
              defaultValue={article?.primary_category ?? "Music"}
              className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
            >
              {BACKOFFICE_ARTICLE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {getBackofficeCategoryLabel(category)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[13px] font-body font-medium text-black/60">
              Publish date
            </span>
            <input
              name="date_label"
              type="date"
              defaultValue={displayDateToInputValue(article?.date_label)}
              className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
            />
          </label>
        </div>

        <div className="mt-6">
          <span className="text-[13px] font-body font-medium text-black/60">
            Extra sections
          </span>
          <div className="mt-3 flex flex-wrap gap-3">
            {BACKOFFICE_ARTICLE_CATEGORIES.map((category) => (
              <label
                key={category}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#faf8f6] px-4 py-2 text-[14px] font-body text-[#181818]"
              >
                <input
                  type="checkbox"
                  name="secondary_categories"
                  value={category}
                  defaultChecked={secondaryCategories.includes(category)}
                  className="h-4 w-4 accent-[#CE2127]"
                />
                {getBackofficeCategoryLabel(category)}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <span className="text-[13px] font-body font-medium text-black/60">
            Tags
          </span>
          <input
            name="tags"
            defaultValue={(article?.tags ?? []).join(", ")}
            className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
            placeholder="Kanye West, Los Angeles, SoFi Stadium"
          />
          <p className="mt-2 text-[12px] font-body leading-[1.6] text-black/45">
            Separate tags with commas. They help search and SEO, but stay hidden on the article page for now.
          </p>
        </div>

        <div className="mt-6">
          <span className="text-[13px] font-body font-medium text-black/60">
            Summary
          </span>
          <textarea
            name="summary"
            defaultValue={article?.summary ?? ""}
            className="mt-2 h-[110px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 py-3 outline-none focus:border-[#CE2127]"
            placeholder="Short recap used across listings and homepage blocks"
            required
          />
        </div>

        <div className="mt-6">
          <span className="text-[13px] font-body font-medium text-black/60">
            Intro
          </span>
          <textarea
            name="intro"
            defaultValue={article?.intro ?? ""}
            className="mt-2 h-[130px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 py-3 outline-none focus:border-[#CE2127]"
            placeholder="Opening paragraph shown at the top of the article"
            required
          />
        </div>

        <div className="mt-6">
          <span className="text-[13px] font-body font-medium text-black/60">
            Body
          </span>
          <ArticleBodyEditor initialValue={article?.body ?? ""} />
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <h2 className="text-[20px] font-body font-bold tracking-[-0.03em] text-[#181818]">
            Publishing
          </h2>
          <label className="mt-4 block">
            <span className="text-[13px] font-body font-medium text-black/60">
              Status
            </span>
            <select
              name="status"
              defaultValue={article?.status ?? "draft"}
              className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
            >
              {BACKOFFICE_ARTICLE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <h2 className="text-[20px] font-body font-bold tracking-[-0.03em] text-[#181818]">
            Media
          </h2>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Cover image link
              </span>
              <input
                name="image"
                defaultValue={article?.image ?? ""}
                className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="https://..."
                required
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Or upload cover image
              </span>
              <input
                name="image_file"
                type="file"
                accept="image/*"
                className="mt-2 block w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 py-3 text-[14px] font-body text-[#181818] file:mr-4 file:rounded-[10px] file:border-0 file:bg-[#CE2127] file:px-4 file:py-2 file:text-white"
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Image caption
              </span>
              <input
                name="image_caption"
                defaultValue={article?.image_caption ?? ""}
                className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="Optional caption"
              />
            </label>
            <div className="rounded-[14px] border border-black/8 bg-[#faf8f6] p-4">
              <div className="mb-3">
                <h3 className="text-[15px] font-body font-semibold text-[#181818]">
                  Image framing
                </h3>
                <p className="mt-1 text-[13px] font-body leading-[1.6] text-black/55">
                  Move the image focus until the subject sits correctly in the frame.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">
                  Image horizontal position
                </span>
                <input
                  name="image_position_x"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  defaultValue={resolvedImagePositionX}
                  className="mt-3 block w-full accent-[#CE2127]"
                />
                <div className="mt-2 text-[12px] font-body text-black/45">
                  {resolvedImagePositionX}% from left
                </div>
              </label>
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">
                  Image vertical position
                </span>
                <input
                  name="image_position_y"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  defaultValue={resolvedImagePositionY}
                  className="mt-3 block w-full accent-[#CE2127]"
                />
                <div className="mt-2 text-[12px] font-body text-black/45">
                  {resolvedImagePositionY}% from top
                </div>
              </label>
              </div>
            </div>
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Hero media type
              </span>
              <select
                name="hero_media_type"
                defaultValue={article?.hero_media_type ?? "image"}
                className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Hero media link
              </span>
              <input
                name="hero_media_src"
                defaultValue={article?.hero_media_src ?? ""}
                className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="https://..."
                required
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Or upload hero image
              </span>
              <input
                name="hero_media_file"
                type="file"
                accept="image/*"
                className="mt-2 block w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 py-3 text-[14px] font-body text-[#181818] file:mr-4 file:rounded-[10px] file:border-0 file:bg-[#CE2127] file:px-4 file:py-2 file:text-white"
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Bottom media type
              </span>
              <select
                name="bottom_media_type"
                defaultValue={article?.bottom_media_type ?? "none"}
                className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
              >
                <option value="none">None</option>
                <option value="image">Image</option>
                <option value="youtube">YouTube</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Bottom media link
              </span>
              <input
                name="bottom_media_src"
                defaultValue={article?.bottom_media_src ?? ""}
                className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="https://..."
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Or upload bottom image
              </span>
              <input
                name="bottom_media_file"
                type="file"
                accept="image/*"
                className="mt-2 block w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 py-3 text-[14px] font-body text-[#181818] file:mr-4 file:rounded-[10px] file:border-0 file:bg-[#CE2127] file:px-4 file:py-2 file:text-white"
              />
            </label>
          </div>
        </div>

        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <h2 className="text-[20px] font-body font-bold tracking-[-0.03em] text-[#181818]">
            Save
          </h2>
          <p className="mt-3 text-[14px] font-body leading-[1.75] text-black/60">
            Save your article here. We can connect this directly to the live site
            publishing flow next.
          </p>
          <button
            type="submit"
            className="mt-5 inline-flex h-[48px] w-full items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
