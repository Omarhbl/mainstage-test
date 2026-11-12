import ArticleMedia from "@/components/article/ArticleMedia";
import ArticleRichContent from "@/components/article/ArticleRichContent";
import { formatArticleDate, normalizeYouTubeEmbedUrl, type ArticleRecord } from "@/lib/articles";

function getEmbeddedYouTubeVideoId(value?: string | null) {
  const normalized = normalizeYouTubeEmbedUrl(value);

  if (!normalized) {
    return "";
  }

  try {
    const url = new URL(normalized);
    const segments = url.pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] ?? "";
  } catch {
    return "";
  }
}

export default function ArticleContent({ article }: { article: ArticleRecord }) {
  const bodyParagraphs = Array.isArray(article.body)
    ? article.body.filter(
        (paragraph) =>
          typeof paragraph === "string" && paragraph.trim().length > 0
      )
    : [];

  const bodyHtml = article.bodyHtml?.trim();
  const heroMediaType = article.heroMedia?.type === "video" ? "video" : "image";
  const heroMediaSrc = article.heroMedia?.src?.trim() || article.image || "";
  const bottomMediaEmbedUrl =
    article.bottomMedia?.type === "youtube"
      ? normalizeYouTubeEmbedUrl(article.bottomMedia.src)
      : "";
  const bottomMediaVideoId = getEmbeddedYouTubeVideoId(article.bottomMedia?.src);
  const bottomMediaThumbnail = bottomMediaVideoId
    ? `https://i.ytimg.com/vi/${bottomMediaVideoId}/hqdefault.jpg`
    : "";
  return (<>
          <h1 className="mx-auto max-w-[760px] text-center text-[26px] font-body font-bold leading-[1.2] tracking-[-0.03em] text-[#171717]">
            {article.title}
          </h1>

          <p className="mx-auto mt-3 max-w-[760px] text-center text-[14px] font-body font-normal text-[rgba(0,0,0,0.62)]">
            {formatArticleDate(article.date)}
          </p>

          <div className="mx-auto mt-10 max-w-[860px] overflow-hidden rounded-[9px] bg-[#ddd7cf]">
            {heroMediaType === "video" && heroMediaSrc ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                className="h-[430px] w-full object-cover"
              >
                <source src={heroMediaSrc} type="video/mp4" />
              </video>
            ) : (
              <ArticleMedia
                src={heroMediaSrc}
                alt={article.title}
                className={article.imageClassName ?? ""}
                fit="natural"
                articleImage={article}
              />
            )}
          </div>

          {article.imageCaption ? (
            <p className="mt-4 text-center text-[12px] font-body font-normal text-[rgba(0,0,0,0.55)]">
              {article.imageCaption}
            </p>
          ) : null}

          <article className="mx-auto mt-10 max-w-[860px]">
            <p className="text-[15px] font-body font-bold leading-[1.95] text-[rgba(0,0,0,0.78)]">
              {article.intro}
            </p>

            {bodyHtml ? (
              <ArticleRichContent html={bodyHtml} />
            ) : (
              <div className="mt-7 space-y-6 text-[15px] font-body font-normal leading-[2] text-[rgba(0,0,0,0.74)]">
                {bodyParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            )}
          </article>

          {article.bottomMedia ? (
            <div className="mx-auto mt-8 max-w-[860px] overflow-hidden rounded-[9px] bg-[#ddd7cf] sm:mt-12">
              {article.bottomMedia.type === "youtube" ? (
                <>
                  {bottomMediaEmbedUrl ? (
                    <div className="hidden sm:block">
                      <iframe
                        className="aspect-video w-full"
                        src={bottomMediaEmbedUrl}
                        title={article.bottomMedia.title ?? article.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                  ) : null}

                  <a
                    href={article.bottomMedia.src}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block sm:hidden"
                    aria-label={`Watch ${article.bottomMedia.title ?? article.title} on YouTube`}
                  >
                    {bottomMediaThumbnail ? (
                      <img
                        src={bottomMediaThumbnail}
                        alt={article.bottomMedia.title ?? article.title}
                        className="aspect-video w-full object-cover"
                      />
                    ) : (
                      <div className="aspect-video w-full bg-[#ece6df]" />
                    )}
                    <div className="absolute inset-0 bg-black/18 transition-colors duration-300 group-hover:bg-black/28" />
                    <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
                      <div className="ml-1 h-0 w-0 border-y-[10px] border-y-transparent border-l-[16px] border-l-[#111]" />
                    </div>
                  </a>
                </>
              ) : (
                <ArticleMedia
                  src={article.bottomMedia.src}
                  alt={article.bottomMedia.title ?? article.title}
                  heightClassName="h-[220px] sm:h-[320px]"
                />
              )}
            </div>
          ) : null}

  </>);
}
