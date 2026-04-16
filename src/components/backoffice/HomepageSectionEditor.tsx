import HomepageTickerEditor from "@/components/backoffice/HomepageTickerEditor";
import HomepageHeroSlidesForm from "@/components/backoffice/HomepageHeroSlidesForm";
import {
  refreshSpotifyFeedAction,
  refreshYoutubeFeedAction,
  updateHomepageSettingsAction,
} from "@/app/backoffice/homepage/actions";
import type { BackofficePublicRow } from "@/lib/public-articles";
import type { HomepageSettings } from "@/lib/supabase/server";

type HomepageSection =
  | "hero"
  | "must-read"
  | "banner"
  | "social"
  | "ticker"
  | "feeds";

type HomepageSectionEditorProps = {
  section: HomepageSection;
  homepageSettings: HomepageSettings;
  articleOptions: ArticleCard[];
  spotifySyncedAt: string;
  youtubeSyncedAt: string;
};

function sectionTarget(section: HomepageSection) {
  return `homepage:${section}`;
}

export default function HomepageSectionEditor({
  section,
  homepageSettings,
  articleOptions,
  spotifySyncedAt,
  youtubeSyncedAt,
}: HomepageSectionEditorProps) {
  const socialItems = homepageSettings.socialItems;
  const heroSlides =
    homepageSettings.heroSlides.length > 0
      ? homepageSettings.heroSlides
      : [
          {
            title: homepageSettings.heroTitle,
            category: homepageSettings.heroCategory,
            href: homepageSettings.heroHref,
            media: homepageSettings.heroMedia,
          },
        ];
  const initialTickerSlugs = homepageSettings.tickerItems.map((item) =>
    item.href.replace("/articles/", "")
  );

  if (section === "hero") {
    return (
      <HomepageHeroSlidesForm
        initialSlides={heroSlides}
        redirectTarget={sectionTarget(section)}
      />
    );
  }

  if (section === "must-read") {
    return (
      <form action={updateHomepageSettingsAction}>
        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Must-Read
          </p>
          <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Choose the featured article
          </h2>
          <input type="hidden" name="section" value="must-read" />
          <input type="hidden" name="redirect_target" value={sectionTarget(section)} />
          <label className="mt-5 block">
            <span className="text-[13px] font-body font-medium text-black/60">
              Must-Read article
            </span>
            <select
              name="must_read_slug"
              defaultValue={homepageSettings.mustReadSlug}
              className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
            >
              {articleOptions.map((article) => (
                <option key={article.slug} value={article.slug}>
                  {article.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="mt-5 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save Must-Read
          </button>
        </div>
      </form>
    );
  }

  if (section === "banner") {
    return (
      <form action={updateHomepageSettingsAction}>
        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Banner ad
          </p>
          <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Update the homepage banner
          </h2>
          <input type="hidden" name="section" value="banner" />
          <input type="hidden" name="redirect_target" value={sectionTarget(section)} />
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Banner image
                <span className="ml-2 text-black/40">
                  Recommended size: 1276 x 120 px
                </span>
              </span>
              <input
                name="banner_image"
                defaultValue={homepageSettings.bannerImage}
                className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="/home-banner-ad.png or full image URL"
              />
            </label>

            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Or upload banner image
              </span>
              <input
                name="banner_image_file"
                type="file"
                accept="image/*"
                className="mt-2 block w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 py-3 text-[14px] font-body text-black/68 file:mr-4 file:rounded-[10px] file:border-0 file:bg-[#CE2127] file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-white"
              />
            </label>

            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Banner click destination
              </span>
              <input
                name="banner_href"
                defaultValue={homepageSettings.bannerHref}
                className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="Paste the link you want the banner to open"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-5 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save banner
          </button>
        </div>
      </form>
    );
  }

  if (section === "social") {
    return (
      <form action={updateHomepageSettingsAction}>
        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Social Highlights
          </p>
          <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Manage the social strip
          </h2>
          <input type="hidden" name="section" value="social" />
          <input type="hidden" name="redirect_target" value={sectionTarget(section)} />
          <div className="mt-5 space-y-4">
            {socialItems.map((item, index) => (
              <div
                key={`social-slot-${index + 1}`}
                className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
              >
                <label className="block">
                  <span className="text-[13px] font-body font-medium text-black/60">
                    Social image {index + 1}
                  </span>
                  <input
                    name={`social_image_${index + 1}`}
                    defaultValue={item.image}
                    className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                    placeholder="Paste image URL"
                  />
                </label>
                <label className="block">
                  <span className="text-[13px] font-body font-medium text-black/60">
                    Social link {index + 1}
                  </span>
                  <input
                    name={`social_href_${index + 1}`}
                    defaultValue={item.href}
                    className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                    placeholder="Optional destination link"
                  />
                </label>
              </div>
            ))}
          </div>
          <button
            type="submit"
            className="mt-5 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save social highlights
          </button>
        </div>
      </form>
    );
  }

  if (section === "ticker") {
    return (
      <form action={updateHomepageSettingsAction}>
        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Red band
          </p>
          <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Choose the ticker headlines
          </h2>
          <p className="mt-2 max-w-[640px] text-[14px] font-body leading-[1.75] text-black/60">
            Pick the article titles you want to rotate in the red headline band at the top of the website.
          </p>
          <input type="hidden" name="section" value="ticker" />
          <input type="hidden" name="redirect_target" value={sectionTarget(section)} />
          <HomepageTickerEditor
            articleOptions={articleOptions}
            initialSlugs={initialTickerSlugs}
          />
          <button
            type="submit"
            className="mt-5 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save red band
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
      <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
        Feed refresh
      </p>
      <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
        Refresh live feeds
      </h2>

      <div className="mt-5 rounded-[16px] border border-black/8 bg-[#faf8f6] p-4">
        <h3 className="text-[16px] font-body font-bold text-[#181818]">
          Keep YouTube and Spotify up to date
        </h3>
        <p className="mt-2 text-[14px] font-body leading-[1.75] text-black/60">
          These feeds should already refresh every hour. Use these buttons if you want to force an immediate update.
        </p>
        <div className="mt-4 space-y-3">
          <div className="rounded-[12px] border border-black/8 bg-white px-4 py-3 text-[14px] font-body text-black/68">
            YouTube last refresh: {youtubeSyncedAt}
          </div>
          <div className="rounded-[12px] border border-black/8 bg-white px-4 py-3 text-[14px] font-body text-black/68">
            Spotify last refresh: {spotifySyncedAt}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <form action={refreshYoutubeFeedAction}>
            <input type="hidden" name="redirect_target" value={sectionTarget(section)} />
            <button
              type="submit"
              className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-black/10 bg-white px-4 text-[14px] font-body font-semibold text-[#181818] transition-colors hover:border-[#CE2127] hover:text-[#CE2127]"
            >
              Refresh YouTube
            </button>
          </form>
          <form action={refreshSpotifyFeedAction}>
            <input type="hidden" name="redirect_target" value={sectionTarget(section)} />
            <button
              type="submit"
              className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-black/10 bg-white px-4 text-[14px] font-body font-semibold text-[#181818] transition-colors hover:border-[#CE2127] hover:text-[#CE2127]"
            >
              Refresh Spotify
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
