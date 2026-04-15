import Link from "next/link";
import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import { getBackofficeArticles } from "@/lib/backoffice-articles";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { getHomepageSettings } from "@/lib/supabase/server";

function isHostedInBackofficeBucket(value?: string | null) {
  return Boolean(value && value.includes("/storage/v1/object/public/media-assets/"));
}

function getMediaSourceLabel(value?: string | null) {
  if (!value) return "Missing";
  return isHostedInBackofficeBucket(value) ? "Uploaded" : "External link";
}

export default async function BackofficeMediaPage() {
  await requireBackofficeAccess(["admin", "editor"]);

  const [homepageSettings, articleRows] = await Promise.all([
    getHomepageSettings(),
    getBackofficeArticles(),
  ]);

  const publishedRows = articleRows.filter((article) => article.status === "published");
  const uploadedCoverCount = articleRows.filter((article) =>
    isHostedInBackofficeBucket(article.image)
  ).length;
  const uploadedHeroCount = articleRows.filter(
    (article) =>
      article.hero_media_type === "image" &&
      isHostedInBackofficeBucket(article.hero_media_src)
  ).length;
  const uploadedBottomCount = articleRows.filter(
    (article) =>
      article.bottom_media_type === "image" &&
      isHostedInBackofficeBucket(article.bottom_media_src)
  ).length;
  const homepageAssetCount =
    1 +
    1 +
    homepageSettings.socialItems.filter((item) => item.image.trim()).length;
  const recentMediaArticles = articleRows.slice(0, 6);

  return (
    <div className="space-y-8">
      <BackofficeHeader
        title="Media"
        subtitle="See the assets currently powering Mainstage, check where they are coming from, and jump straight to the right place when the team needs to update a visual."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Article covers
          </p>
          <p className="mt-3 text-[40px] font-body font-bold tracking-[-0.05em] text-[#181818]">
            {String(articleRows.length).padStart(2, "0")}
          </p>
          <p className="mt-2 text-[14px] font-body leading-[1.75] text-black/60">
            Total article cover visuals currently attached across the newsroom.
          </p>
        </div>

        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Uploaded files
          </p>
          <p className="mt-3 text-[40px] font-body font-bold tracking-[-0.05em] text-[#181818]">
            {String(uploadedCoverCount + uploadedHeroCount + uploadedBottomCount).padStart(2, "0")}
          </p>
          <p className="mt-2 text-[14px] font-body leading-[1.75] text-black/60">
            Visuals already hosted in the Mainstage media bucket instead of external links.
          </p>
        </div>

        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Homepage assets
          </p>
          <p className="mt-3 text-[40px] font-body font-bold tracking-[-0.05em] text-[#181818]">
            {String(homepageAssetCount).padStart(2, "0")}
          </p>
          <p className="mt-2 text-[14px] font-body leading-[1.75] text-black/60">
            Hero media, banner creative, and the current social highlight visuals.
          </p>
        </div>

        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Live stories
          </p>
          <p className="mt-3 text-[40px] font-body font-bold tracking-[-0.05em] text-[#181818]">
            {String(publishedRows.length).padStart(2, "0")}
          </p>
          <p className="mt-2 text-[14px] font-body leading-[1.75] text-black/60">
            Published articles currently using visuals on the live website.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="space-y-5">
          <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                  Homepage media
                </p>
                <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                  Current live visuals
                </h2>
              </div>
              <Link
                href="/backoffice/homepage"
                className="inline-flex h-[46px] items-center justify-center rounded-[12px] border border-black/10 bg-white px-5 text-[14px] font-body font-semibold text-[#181818] transition-opacity hover:opacity-80"
              >
                Edit homepage media
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-4">
                <p className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-black/45">
                  Hero slider
                </p>
                <div className="mt-3 overflow-hidden rounded-[12px] bg-black/5">
                  {homepageSettings.heroMedia ? (
                    homepageSettings.heroMedia.endsWith(".mp4") ? (
                      <div className="flex h-[190px] items-center justify-center bg-[#181818] text-[14px] font-body font-semibold text-white/80">
                        Video hero media
                      </div>
                    ) : (
                      <img
                        src={homepageSettings.heroMedia}
                        alt="Homepage hero media"
                        className="h-[190px] w-full object-cover"
                      />
                    )
                  ) : (
                    <div className="flex h-[190px] items-center justify-center bg-[#f1ede8] text-[14px] font-body text-black/45">
                      No hero media yet
                    </div>
                  )}
                </div>
                <p className="mt-3 text-[14px] font-body font-semibold text-[#181818]">
                  {homepageSettings.heroTitle}
                </p>
                <p className="mt-1 text-[13px] font-body text-black/55">
                  Source: {getMediaSourceLabel(homepageSettings.heroMedia)}
                </p>
              </div>

              <div className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-4">
                <p className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-black/45">
                  Banner ad
                </p>
                <div className="mt-3 overflow-hidden rounded-[12px] bg-black/5">
                  {homepageSettings.bannerImage ? (
                    <img
                      src={homepageSettings.bannerImage}
                      alt="Homepage banner"
                      className="h-[190px] w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-[190px] items-center justify-center bg-[#f1ede8] text-[14px] font-body text-black/45">
                      No banner yet
                    </div>
                  )}
                </div>
                <p className="mt-3 text-[13px] font-body text-black/55">
                  Source: {getMediaSourceLabel(homepageSettings.bannerImage)}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-black/45">
                Social highlight strip
              </p>
              <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                {homepageSettings.socialItems.map((item, index) => (
                  <div
                    key={`social-preview-${index + 1}`}
                    className="rounded-[14px] border border-black/8 bg-[#faf8f6] p-3"
                  >
                    <div className="overflow-hidden rounded-[10px] bg-black/5">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={`Social highlight ${index + 1}`}
                          className="h-[130px] w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-[130px] items-center justify-center bg-[#f1ede8] text-[12px] font-body text-black/45">
                          Empty slot
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-[12px] font-body text-black/55">
                      Slot {index + 1}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                  Article visuals
                </p>
                <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                  Latest media in use
                </h2>
              </div>
              <Link
                href="/backoffice/articles"
                className="inline-flex h-[46px] items-center justify-center rounded-[12px] border border-black/10 bg-white px-5 text-[14px] font-body font-semibold text-[#181818] transition-opacity hover:opacity-80"
              >
                Open articles
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {recentMediaArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/backoffice/articles/${article.id}`}
                  className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 rounded-[16px] border border-black/8 bg-[#faf8f6] p-4 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <div className="overflow-hidden rounded-[10px] bg-black/5">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="h-[96px] w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-body font-semibold uppercase tracking-[0.12em] text-black/45">
                      {article.primary_category}
                    </p>
                    <h3 className="mt-1 truncate text-[17px] font-body font-bold text-[#181818]">
                      {article.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2 text-[12px] font-body text-black/55">
                      <span className="rounded-full border border-black/10 bg-white px-3 py-1">
                        Cover: {getMediaSourceLabel(article.image)}
                      </span>
                      <span className="rounded-full border border-black/10 bg-white px-3 py-1">
                        Hero: {article.hero_media_type}
                      </span>
                      <span className="rounded-full border border-black/10 bg-white px-3 py-1">
                        Bottom: {article.bottom_media_type}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
              Asset checklist
            </p>
            <div className="mt-4 space-y-3">
              {[
                ["Homepage banners", "Managed from the Homepage section."],
                ["Social highlight visuals", "Managed from the Homepage section."],
                ["Article cover images", "Managed inside each article."],
                ["Hero images and videos", "Managed inside each article."],
                ["Bottom media", "Managed inside each article."],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-[14px] border border-black/8 bg-[#faf8f6] px-4 py-3"
                >
                  <p className="text-[14px] font-body font-semibold text-[#181818]">
                    {title}
                  </p>
                  <p className="mt-1 text-[13px] font-body leading-[1.7] text-black/58">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
              Upload guidance
            </p>
            <div className="mt-4 space-y-4 text-[14px] font-body leading-[1.75] text-black/60">
              <p>
                When possible, upload visuals directly inside article editing so they are saved in the Mainstage media bucket and stay stable over time.
              </p>
              <p>
                For homepage creatives, use the Homepage section to update the hero slider, social strip, and banner placements.
              </p>
              <p>
                If a visual is being cropped badly on the website, the team can open the article and adjust the image framing controls there.
              </p>
            </div>
          </div>

          <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
              Quick links
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3">
              {[
                ["/backoffice/homepage", "Homepage media controls"],
                ["/backoffice/articles", "All articles"],
                ["/backoffice/feeds", "Feed health"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-[14px] border border-black/8 bg-[#faf8f6] px-4 py-3 text-[14px] font-body font-semibold text-[#181818] transition-colors hover:bg-[#f1ede8]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
