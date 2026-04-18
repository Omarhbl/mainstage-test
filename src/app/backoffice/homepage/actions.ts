"use server";

import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import {
  createSupabaseAdminClient,
  getHomepageSettings,
} from "@/lib/supabase/server";
import { getPublicArticles } from "@/lib/public-articles";
import { getSiteUrl } from "@/lib/seo";
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

function sanitizeStorageFileName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uploadHomepageImage(file: File, folder: string) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    throw new Error("Missing service role key in .env.local.");
  }

  const extension = path.extname(file.name) || ".png";
  const baseName = sanitizeStorageFileName(path.basename(file.name, extension)) || "image";
  const fileName = `${folder}/${Date.now()}-${baseName}${extension.toLowerCase()}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await adminClient.storage
    .from(HOMEPAGE_MEDIA_BUCKET)
    .upload(fileName, arrayBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

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

function getInternalFeedRefreshUrl(service: "youtube" | "spotify") {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? getSiteUrl()
      : "http://127.0.0.1:3000";

  return `${baseUrl}/api/feeds/cron?service=${service}&force=true`;
}

async function triggerFeedRefresh(service: "youtube" | "spotify") {
  const secret = process.env.CRON_SECRET;
  const cronUrl = getInternalFeedRefreshUrl(service);

  if (!secret) {
    throw new Error("CRON_SECRET is missing in the environment configuration.");
  }

  const response = await fetch(cronUrl, {
    method: "GET",
    headers: {
      authorization: `Bearer ${secret}`,
      accept: "application/json",
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(
      typeof payload?.error === "string" && payload.error.trim()
        ? payload.error
        : `We couldn’t refresh the ${service} feed right now.`
    );
  }

  return payload;
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
