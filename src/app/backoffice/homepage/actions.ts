"use server";

import { clampSlidePosition } from "@/lib/homepage-slides";
import { normalizeArticleAd, safeAdUrl } from "@/lib/article-ad";

import { prepareEditorImage } from "@/lib/security/image";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { refreshFeedsIfNeeded } from "@/lib/feed-sync";
import {
  createSupabaseAdminClient,
  getHomepageSettings,
} from "@/lib/supabase/server";
import { getPublicArticles } from "@/lib/public-articles";
const HOMEPAGE_MEDIA_BUCKET = "media-assets";

function getBackofficeRedirectTarget(value?: string | null) {
  if (value?.startsWith("homepage:")) {
    const section = value.replace("homepage:", "").trim();

    if (section) {
      return `/backoffice/homepage/${section}`;
    }
  }

  if (value === "feeds") {
    return "/backoffice/feeds";
  }

  return "/backoffice/homepage";
}

function buildBackofficeRedirect(
  target: string | null | undefined,
  message: string,
  type: "success" | "error"
) {
  const params = new URLSearchParams({
    notice: message,
    type,
  });

  redirect(`${getBackofficeRedirectTarget(target)}?${params.toString()}`);
}

async function uploadHomepageImage(file: File, folder: string) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    throw new Error("Missing service role key in .env.local.");
  }

  const image = await prepareEditorImage(file);
  const fileName = `${folder}/${crypto.randomUUID()}.${image.extension}`;
  const { error } = await adminClient.storage.from(HOMEPAGE_MEDIA_BUCKET)
    .upload(fileName, image.bytes, { contentType: image.contentType, upsert: false });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = adminClient.storage.from(HOMEPAGE_MEDIA_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function updateHomepageSettingsAction(formData: FormData) {
  await requireBackofficeAccess(["admin", "editor"]);

  const section = String(formData.get("section") ?? "").trim();
  const redirectTarget = String(formData.get("redirect_target") ?? "homepage").trim();
  const currentSettings = await getHomepageSettings();
  const heroSlidesCount = Math.max(
    Number.parseInt(String(formData.get("hero_slides_count") ?? "1"), 10) || 1,
    1
  );
  const heroSlides = Array.from({ length: heroSlidesCount }, (_, index) => ({
    title: String(formData.get(`hero_title_${index + 1}`) ?? "").trim(),
    category: String(formData.get(`hero_category_${index + 1}`) ?? "").trim(),
    href: String(formData.get(`hero_href_${index + 1}`) ?? "").trim(),
    media: String(formData.get(`hero_media_${index + 1}`) ?? "").trim(),
    positionX: clampSlidePosition(formData.get(`hero_position_x_${index + 1}`)),
    positionY: clampSlidePosition(formData.get(`hero_position_y_${index + 1}`)),
    mobilePositionX: clampSlidePosition(formData.get(`hero_mobile_position_x_${index + 1}`), clampSlidePosition(formData.get(`hero_position_x_${index + 1}`))),
    mobilePositionY: clampSlidePosition(formData.get(`hero_mobile_position_y_${index + 1}`), clampSlidePosition(formData.get(`hero_position_y_${index + 1}`))),
  })).filter((item) => item.title || item.category || item.href || item.media);
  const tickerSlugs = formData
    .getAll("ticker_slug")
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);
  const mustReadSlug = String(formData.get("must_read_slug") ?? "").trim();
  const bannerImage = String(formData.get("banner_image") ?? "").trim();
  const bannerImageFile = formData.get("banner_image_file");
  const bannerHref = String(formData.get("banner_href") ?? "").trim();
  const socialItems = Array.from({ length: 5 }, (_, index) => ({
    image: String(formData.get(`social_image_${index + 1}`) ?? "").trim(),
    href: String(formData.get(`social_href_${index + 1}`) ?? "").trim(),
  }));
  const uploadedBannerImage =
    bannerImageFile instanceof File && bannerImageFile.size > 0
      ? await uploadHomepageImage(bannerImageFile, "homepage/banner")
      : "";
  const resolvedBannerImage = uploadedBannerImage || bannerImage;
  let articleAd;
  if (section === "banner") {
    const desktopFile = formData.get("article_ad_desktop_file");
    const mobileFile = formData.get("article_ad_mobile_file");
    const desktopImage = desktopFile instanceof File && desktopFile.size > 0 ? await uploadHomepageImage(desktopFile, "ads/article-desktop") : String(formData.get("article_ad_desktop") ?? "").trim();
    const mobileImage = mobileFile instanceof File && mobileFile.size > 0 ? await uploadHomepageImage(mobileFile, "ads/article-mobile") : String(formData.get("article_ad_mobile") ?? "").trim();
    const enabled = formData.get("article_ad_enabled") === "on";
    const href = String(formData.get("article_ad_href") ?? "").trim();
    if ((desktopImage && !safeAdUrl(desktopImage, true)) || (mobileImage && !safeAdUrl(mobileImage, true)) || (href && !safeAdUrl(href))) buildBackofficeRedirect(redirectTarget, "Use an HTTPS image URL or a local image path, and a valid destination link.", "error");
    if (enabled && (!desktopImage || !mobileImage)) buildBackofficeRedirect(redirectTarget, "Add both the desktop and mobile artwork before enabling article ads.", "error");
    articleAd = normalizeArticleAd({ enabled, desktopImage, mobileImage, href });
  }

  if (
    section === "hero" &&
    (heroSlides.length === 0 ||
      heroSlides.some((item) => !item.title || !item.category || !item.href || !item.media))
  ) {
    buildBackofficeRedirect(
      redirectTarget,
      "Please complete every filled homepage slide before saving.",
      "error"
    );
  }

  if (section === "must-read" && !mustReadSlug) {
    buildBackofficeRedirect(
      redirectTarget,
      "Please choose the Must-Read article before saving.",
      "error"
    );
  }

  if (section === "ticker" && tickerSlugs.length === 0) {
    buildBackofficeRedirect(
      redirectTarget,
      "Please choose at least one article for the red band.",
      "error"
    );
  }

  if (section === "banner" && !resolvedBannerImage) {
    buildBackofficeRedirect(
      redirectTarget,
      "Please add the banner image before saving.",
      "error"
    );
  }

  if (section === "social" && socialItems.some((item) => !item.image)) {
    buildBackofficeRedirect(
      redirectTarget,
      "Please complete all social highlight image fields before saving.",
      "error"
    );
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildBackofficeRedirect(
      redirectTarget,
      "Missing service role key in .env.local.",
      "error"
    );
  }

  const publicArticles = section === "ticker" ? await getPublicArticles() : [];
  const tickerItems =
    section === "ticker"
      ? tickerSlugs
          .map((slug) => publicArticles.find((article) => article.slug === slug))
          .filter((article): article is NonNullable<typeof article> => Boolean(article))
          .map((article) => ({
            title: article.title,
            href: `/articles/${article.slug}`,
          }))
      : currentSettings.tickerItems;

  if (section === "ticker" && tickerItems.length === 0) {
    buildBackofficeRedirect(
      redirectTarget,
      "We couldn’t match the selected red band articles.",
      "error"
    );
  }

  const payload = {
    key: "homepage_settings",
    value: {
      heroTitle: section === "hero" ? heroSlides[0].title : currentSettings.heroTitle,
      heroCategory:
        section === "hero" ? heroSlides[0].category : currentSettings.heroCategory,
      heroHref: section === "hero" ? heroSlides[0].href : currentSettings.heroHref,
      heroMedia: section === "hero" ? heroSlides[0].media : currentSettings.heroMedia,
      heroSlides:
        section === "hero"
          ? heroSlides
          : currentSettings.heroSlides,
      tickerItems,
      mustReadSlug:
        section === "must-read" ? mustReadSlug : currentSettings.mustReadSlug,
      bannerImage:
        section === "banner" ? resolvedBannerImage : currentSettings.bannerImage,
      bannerHref: section === "banner" ? bannerHref : currentSettings.bannerHref,
      articleAd: section === "banner" ? articleAd! : currentSettings.articleAd,
      socialItems: section === "social" ? socialItems : currentSettings.socialItems,
    },
    updated_at: new Date().toISOString(),
  };

  const { data: existingSetting, error: existingError } = await adminClient!
    .from("site_settings")
    .select("key")
    .eq("key", "homepage_settings")
    .maybeSingle();

  if (existingError) {
    buildBackofficeRedirect(
      redirectTarget,
      existingError.message ||
        "We couldn’t load the homepage settings before saving.",
      "error"
    );
  }

  const { error } = existingSetting
    ? await adminClient!
        .from("site_settings")
        .update({
          value: payload.value,
          updated_at: payload.updated_at,
        })
        .eq("key", payload.key)
    : await adminClient!.from("site_settings").insert(payload);

  if (error) {
    buildBackofficeRedirect(
      redirectTarget,
      error.message ||
        "We couldn’t save the homepage settings. Please check the site_settings table and try again.",
      "error"
    );
  }

  revalidatePath("/");
  revalidatePath("/backoffice/homepage");
  if (section === "banner") {
    revalidatePath("/articles/[slug]", "page");
    revalidatePath("/backoffice/homepage/banner");
  }
  const successMessage =
    section === "hero"
      ? "Homepage slides updated successfully."
      : section === "ticker"
        ? "Red band headlines updated successfully."
      : section === "must-read"
        ? "Must-Read article updated successfully."
        : section === "banner"
          ? "Banner ad updated successfully."
          : section === "social"
            ? "Social Highlights updated successfully."
            : "Homepage settings updated successfully.";
  buildBackofficeRedirect(redirectTarget, successMessage, "success");
}

function revalidateFeedSurfaces() {
  revalidatePath("/");
  revalidatePath("/music");
  revalidatePath("/music/top-50");
  revalidatePath("/backoffice");
  revalidatePath("/backoffice/feeds");
  revalidatePath("/backoffice/homepage");
}

async function triggerFeedRefresh(service: "youtube" | "spotify") {
  return refreshFeedsIfNeeded({
    force: true,
    service,
  });
}

export async function refreshYoutubeFeedAction(formData?: FormData) {
  await requireBackofficeAccess(["admin", "editor"]);
  const target = String(formData?.get("redirect_target") ?? "homepage");

  try {
    const result = await triggerFeedRefresh("youtube");
    revalidateFeedSurfaces();
    buildBackofficeRedirect(
      target,
      result.note
        ? `YouTube Morocco refresh completed. ${result.note}`
        : "YouTube Morocco refresh completed successfully.",
      "success"
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    buildBackofficeRedirect(
      target,
      error instanceof Error ? error.message : "We couldn’t refresh the YouTube feed.",
      "error"
    );
  }
}

export async function refreshSpotifyFeedAction(formData?: FormData) {
  await requireBackofficeAccess(["admin", "editor"]);
  const target = String(formData?.get("redirect_target") ?? "homepage");

  try {
    const result = await triggerFeedRefresh("spotify");
    revalidateFeedSurfaces();
    buildBackofficeRedirect(
      target,
      result.note
        ? `Spotify Morocco refresh completed. ${result.note}`
        : "Spotify Morocco refresh completed successfully.",
      "success"
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    buildBackofficeRedirect(
      target,
      error instanceof Error ? error.message : "We couldn’t refresh the Spotify feed.",
      "error"
    );
  }
}
