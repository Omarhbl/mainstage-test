"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  articlesBySlug,
  formatArticleDate,
  normalizeYouTubeEmbedUrl,
} from "@/lib/articles";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  BACKOFFICE_ARTICLE_CATEGORIES,
  BACKOFFICE_ARTICLE_STATUSES,
  inputDateToDisplayValue,
  normalizeSecondaryCategories,
  sanitizeStorageFileName,
  slugifyArticleTitle,
} from "@/lib/backoffice-articles";
import {
  paragraphsToHtml,
  sanitizeArticleBodyHtml,
} from "@/lib/article-rich-text";

const BACKOFFICE_MEDIA_BUCKET = "media-assets";

function buildArticlesRedirect(
  path: string,
  message: string,
  type: "success" | "error"
): never {
  const params = new URLSearchParams({
    notice: message,
    type,
  });

  redirect(`${path}?${params.toString()}`);
}

async function uploadBackofficeImage(
  file: File,
  folder: "covers" | "hero" | "bottom"
) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return { error: "Missing service role key in .env.local." };
  }

  const safeName = sanitizeStorageFileName(file.name || "image");
  const path = `${folder}/${Date.now()}-${safeName}`;

  const { error } = await adminClient.storage
    .from(BACKOFFICE_MEDIA_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (error) {
    return {
      error:
        "We couldn’t upload that image yet. Please make sure the media-assets bucket exists in Supabase Storage.",
    };
  }

  const { data } = adminClient.storage
    .from(BACKOFFICE_MEDIA_BUCKET)
    .getPublicUrl(path);

  return { url: data.publicUrl };
}

async function parseArticlePayload(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const primaryCategory = String(formData.get("primary_category") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const intro = String(formData.get("intro") ?? "").trim();
  const rawBody = String(formData.get("body") ?? "").trim();
  const tags = [...new Set(
    String(formData.get("tags") ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
  )];
  const image = String(formData.get("image") ?? "").trim();
  const imageCaption = String(formData.get("image_caption") ?? "").trim();
  const heroMediaType = String(formData.get("hero_media_type") ?? "").trim();
  const heroMediaSrc = String(formData.get("hero_media_src") ?? "").trim();
  const bottomMediaType = String(formData.get("bottom_media_type") ?? "").trim();
  const bottomMediaSrc = String(formData.get("bottom_media_src") ?? "").trim();
  const dateLabel = inputDateToDisplayValue(
    String(formData.get("date_label") ?? "").trim()
  );
  const status = String(formData.get("status") ?? "").trim();
  const imageFile = formData.get("image_file");
  const heroMediaFile = formData.get("hero_media_file");
  const bottomMediaFile = formData.get("bottom_media_file");
  const hasCoverUpload = imageFile instanceof File && imageFile.size > 0;
  const hasHeroUpload =
    heroMediaFile instanceof File && heroMediaFile.size > 0;
  const hasBottomUpload =
    bottomMediaFile instanceof File && bottomMediaFile.size > 0;
  const secondaryCategories = normalizeSecondaryCategories(
    formData
      .getAll("secondary_categories")
      .map((value) => String(value).trim())
      .filter(Boolean),
    primaryCategory
  );
  const rawImagePositionX = Number(formData.get("image_position_x") ?? 50);
  const rawImagePositionY = Number(formData.get("image_position_y") ?? 50);
  const imagePositionX = Number.isFinite(rawImagePositionX)
    ? Math.min(100, Math.max(0, rawImagePositionX))
    : 50;
  const imagePositionY = Number.isFinite(rawImagePositionY)
    ? Math.min(100, Math.max(0, rawImagePositionY))
    : 50;

  if (
    !title ||
    !summary ||
    !intro ||
    !rawBody ||
    (!image && !hasCoverUpload) ||
    (heroMediaType === "image" && !heroMediaSrc && !hasHeroUpload) ||
    (heroMediaType === "video" && !heroMediaSrc) ||
    !BACKOFFICE_ARTICLE_CATEGORIES.includes(
      primaryCategory as (typeof BACKOFFICE_ARTICLE_CATEGORIES)[number]
    ) ||
    !["image", "video"].includes(heroMediaType) ||
    !["none", "image", "youtube"].includes(bottomMediaType) ||
    (bottomMediaType === "image" && !bottomMediaSrc && !hasBottomUpload) ||
    (bottomMediaType === "youtube" && !bottomMediaSrc) ||
    !BACKOFFICE_ARTICLE_STATUSES.includes(
      status as (typeof BACKOFFICE_ARTICLE_STATUSES)[number]
    )
  ) {
    return null;
  }

  const body = sanitizeArticleBodyHtml(
    rawBody.includes("<") ? rawBody : paragraphsToHtml(rawBody)
  );

  let finalImage = image;
  let finalHeroMediaSrc = heroMediaSrc;
  let finalBottomMediaSrc =
    bottomMediaType === "none" ? null : bottomMediaSrc || null;

  if (hasCoverUpload) {
    const upload = await uploadBackofficeImage(imageFile, "covers");

    if (upload.error || !upload.url) {
      return { error: upload.error };
    }

    finalImage = upload.url;
  }

  if (
    heroMediaType === "image" &&
    hasHeroUpload
  ) {
    const upload = await uploadBackofficeImage(heroMediaFile, "hero");

    if (upload.error || !upload.url) {
      return { error: upload.error };
    }

    finalHeroMediaSrc = upload.url;
  }

  if (
    bottomMediaType === "image" &&
    hasBottomUpload
  ) {
    const upload = await uploadBackofficeImage(bottomMediaFile, "bottom");

    if (upload.error || !upload.url) {
      return { error: upload.error };
    }

    finalBottomMediaSrc = upload.url;
  }

  if (bottomMediaType === "youtube" && finalBottomMediaSrc) {
    finalBottomMediaSrc = normalizeYouTubeEmbedUrl(finalBottomMediaSrc);
  }

  return {
    title,
    slug: slugifyArticleTitle(rawSlug || title),
    primary_category: primaryCategory,
    secondary_categories: secondaryCategories,
    tags,
    summary,
    intro,
    body,
    image: finalImage,
    image_caption: imageCaption || null,
    hero_media_type: heroMediaType,
    hero_media_src: finalHeroMediaSrc,
    bottom_media_type: bottomMediaType,
    bottom_media_src: finalBottomMediaSrc,
    date_label: dateLabel || new Intl.DateTimeFormat("en-GB").format(new Date()),
    status,
    updated_at: new Date().toISOString(),
    imagePositionX,
    imagePositionY,
  };
}

async function saveArticleTags(slug: string, tags: string[]) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return;
  }

  const { data } = await adminClient
    .from("site_settings")
    .select("value")
    .eq("key", "article_tags")
    .maybeSingle();

  const currentValue =
    data?.value && typeof data.value === "object" && !Array.isArray(data.value)
      ? (data.value as Record<string, unknown>)
      : {};

  const nextValue = { ...currentValue };

  if (tags.length > 0) {
    nextValue[slug] = tags;
  } else {
    delete nextValue[slug];
  }

  await adminClient.from("site_settings").upsert(
    {
      key: "article_tags",
      value: nextValue,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );
}

async function deleteArticleTags(slug: string) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return;
  }

  const { data } = await adminClient
    .from("site_settings")
    .select("value")
    .eq("key", "article_tags")
    .maybeSingle();

  const currentValue =
    data?.value && typeof data.value === "object" && !Array.isArray(data.value)
      ? (data.value as Record<string, unknown>)
      : {};

  if (!(slug in currentValue)) {
    return;
  }

  const nextValue = { ...currentValue };
  delete nextValue[slug];

  await adminClient.from("site_settings").upsert(
    {
      key: "article_tags",
      value: nextValue,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );
}

async function saveArticleImageOverride(
  slug: string,
  imagePositionX: number,
  imagePositionY: number
) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return;
  }

  const { data } = await adminClient
    .from("site_settings")
    .select("value")
    .eq("key", "article_image_overrides")
    .maybeSingle();

  const currentValue =
    data?.value && typeof data.value === "object" && !Array.isArray(data.value)
      ? (data.value as Record<string, unknown>)
      : {};

  const nextValue = {
    ...currentValue,
    [slug]: {
      imagePositionX,
      imagePositionY,
    },
  };

  await adminClient.from("site_settings").upsert(
    {
      key: "article_image_overrides",
      value: nextValue,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );
}

async function backofficeArticlesHasPublishedByColumn() {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return false;
  }

  const { error } = await adminClient
    .from("backoffice_articles")
    .select("published_by_name")
    .limit(1);

  return !error;
}

async function revalidateArticleSurfaces(slug?: string | null) {
  revalidatePath("/backoffice/articles");
  revalidatePath("/");
  revalidatePath("/trending");
  revalidatePath("/music");
  revalidatePath("/sport");
  revalidatePath("/people");
  revalidatePath("/cinema");
  revalidatePath("/events");
  revalidatePath("/culture");

  if (slug) {
    revalidatePath(`/articles/${slug}`);
  }
}

export async function createArticleAction(formData: FormData) {
  const access = await requireBackofficeAccess(["admin", "editor"]);

  const payload = await parseArticlePayload(formData);

  if (!payload || "error" in payload) {
    buildArticlesRedirect(
      "/backoffice/articles/new",
      payload && "error" in payload
        ? payload.error || "We couldn’t upload that image."
        : "Please complete all required article fields before saving.",
      "error"
    );
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildArticlesRedirect(
      "/backoffice/articles/new",
      "Missing service role key in .env.local.",
      "error"
    );
  }

  const {
    tags,
    imagePositionX,
    imagePositionY,
    ...databasePayload
  } = payload;

  const finalPayload = { ...databasePayload } as typeof databasePayload & {
    published_by_name?: string | null;
  };

  if (
    finalPayload.status === "published" &&
    await backofficeArticlesHasPublishedByColumn()
  ) {
    finalPayload.published_by_name = access.fullName;
  }

  const { data, error } = await adminClient!
    .from("backoffice_articles")
    .insert(finalPayload)
    .select("id")
    .single();

  if (error || !data?.id) {
    buildArticlesRedirect(
      "/backoffice/articles/new",
      error?.message ||
        "We couldn’t save this article yet. Please check the article storage setup and try again.",
      "error"
    );
  }

  revalidatePath(`/backoffice/articles/${data.id}`);
  await saveArticleImageOverride(
    payload.slug,
    imagePositionX,
    imagePositionY
  );
  await saveArticleTags(payload.slug, tags);
  await revalidateArticleSurfaces(payload.slug);
  buildArticlesRedirect(
    `/backoffice/articles/${data.id}`,
    "Article created successfully.",
    "success"
  );
}

export async function updateArticleAction(formData: FormData) {
  const access = await requireBackofficeAccess(["admin", "editor"]);

  const id = String(formData.get("id") ?? "").trim();
  const payload = await parseArticlePayload(formData);

  if (!id || !payload || "error" in payload) {
    buildArticlesRedirect(
      `/backoffice/articles/${id || ""}`,
      payload && "error" in payload
        ? payload.error || "We couldn’t upload that image."
        : "Please complete all required article fields before saving.",
      "error"
    );
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildArticlesRedirect(
      `/backoffice/articles/${id}`,
      "Missing service role key in .env.local.",
      "error"
    );
  }

  const {
    tags,
    imagePositionX,
    imagePositionY,
    ...databasePayload
  } = payload;

  const finalPayload = { ...databasePayload } as typeof databasePayload & {
    published_by_name?: string | null;
  };

  if (await backofficeArticlesHasPublishedByColumn()) {
    const { data: existingArticle } = await adminClient!
      .from("backoffice_articles")
      .select("published_by_name")
      .eq("id", id)
      .maybeSingle();

    if (finalPayload.status === "published") {
      finalPayload.published_by_name =
        existingArticle?.published_by_name?.trim() || access.fullName;
    }
  }

  const { error } = await adminClient!
    .from("backoffice_articles")
    .update(finalPayload)
    .eq("id", id);

  if (error) {
    buildArticlesRedirect(
      `/backoffice/articles/${id}`,
      error.message || "We couldn’t update this article. Please try again.",
      "error"
    );
  }

  revalidatePath(`/backoffice/articles/${id}`);
  await saveArticleImageOverride(
    payload.slug,
    imagePositionX,
    imagePositionY
  );
  await saveArticleTags(payload.slug, tags);
  await revalidateArticleSurfaces(payload.slug);
  buildArticlesRedirect(
    `/backoffice/articles/${id}`,
    "Article updated successfully.",
    "success"
  );
}

export async function importExistingArticlesAction() {
  await requireBackofficeAccess(["admin", "editor"]);

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildArticlesRedirect(
      "/backoffice/articles",
      "Missing service role key in .env.local.",
      "error"
    );
  }

  const existingArticles = Object.values(articlesBySlug).map((article) => ({
    title: article.title,
    slug: article.slug,
    primary_category: article.category,
    secondary_categories: article.categories ?? [],
    summary: article.summary,
    intro: article.intro,
    body: article.body.join("\n\n"),
    image: article.image,
    image_caption: article.imageCaption ?? null,
    hero_media_type: article.heroMedia.type,
    hero_media_src: article.heroMedia.src,
    bottom_media_type: article.bottomMedia?.type ?? "none",
    bottom_media_src: article.bottomMedia?.src ?? null,
    date_label: formatArticleDate(article.date),
    status: "published",
    updated_at: new Date().toISOString(),
  }));

  const { error } = await adminClient!.from("backoffice_articles").upsert(
    existingArticles,
    {
      onConflict: "slug",
    }
  );

  if (error) {
    buildArticlesRedirect(
      "/backoffice/articles",
      error.message ||
        "We couldn’t import the existing website articles yet. Please check the article table and try again.",
      "error"
    );
  }

  revalidatePath("/backoffice/articles");
  buildArticlesRedirect(
    "/backoffice/articles",
    `Imported ${existingArticles.length} existing articles into the backstage.`,
    "success"
  );
}

export async function publishArticleQuickAction(formData: FormData) {
  const access = await requireBackofficeAccess(["admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    buildArticlesRedirect(
      "/backoffice/articles",
      "We couldn’t find the article to publish.",
      "error"
    );
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildArticlesRedirect(
      "/backoffice/articles",
      "Missing service role key in .env.local.",
      "error"
    );
  }

  const { data: article, error: articleError } = await adminClient!
    .from("backoffice_articles")
    .select("slug,published_by_name")
    .eq("id", id)
    .maybeSingle();

  if (articleError || !article) {
    buildArticlesRedirect(
      "/backoffice/articles",
      "We couldn’t find that article to publish.",
      "error"
    );
  }

  const nextPayload: {
    status: "published";
    updated_at: string;
    published_by_name?: string;
  } = {
    status: "published",
    updated_at: new Date().toISOString(),
  };

  if (await backofficeArticlesHasPublishedByColumn()) {
    nextPayload.published_by_name =
      article.published_by_name?.trim() || access.fullName;
  }

  const { error } = await adminClient!
    .from("backoffice_articles")
    .update(nextPayload)
    .eq("id", id);

  if (error) {
    buildArticlesRedirect(
      "/backoffice/articles",
      error.message || "We couldn’t publish this article right now.",
      "error"
    );
  }

  await revalidateArticleSurfaces(article.slug);
  buildArticlesRedirect(
    "/backoffice/articles",
    "Article published successfully.",
    "success"
  );
}

export async function unpublishArticleQuickAction(formData: FormData) {
  await requireBackofficeAccess(["admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    buildArticlesRedirect(
      "/backoffice/articles",
      "We couldn’t find the article to unpublish.",
      "error"
    );
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildArticlesRedirect(
      "/backoffice/articles",
      "Missing service role key in .env.local.",
      "error"
    );
  }

  const { data: article, error: articleError } = await adminClient!
    .from("backoffice_articles")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  if (articleError || !article) {
    buildArticlesRedirect(
      "/backoffice/articles",
      "We couldn’t find that article to unpublish.",
      "error"
    );
  }

  const { error } = await adminClient!
    .from("backoffice_articles")
    .update({
      status: "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    buildArticlesRedirect(
      "/backoffice/articles",
      error.message || "We couldn’t unpublish this article right now.",
      "error"
    );
  }

  await revalidateArticleSurfaces(article.slug);
  buildArticlesRedirect(
    "/backoffice/articles",
    "Article moved back to draft.",
    "success"
  );
}

export async function deleteArticleQuickAction(formData: FormData) {
  await requireBackofficeAccess(["admin", "editor"]);
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    buildArticlesRedirect(
      "/backoffice/articles",
      "We couldn’t find the article to delete.",
      "error"
    );
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildArticlesRedirect(
      "/backoffice/articles",
      "Missing service role key in .env.local.",
      "error"
    );
  }

  const { data: article, error: articleError } = await adminClient!
    .from("backoffice_articles")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  if (articleError || !article) {
    buildArticlesRedirect(
      "/backoffice/articles",
      "We couldn’t find that article to delete.",
      "error"
    );
  }

  const { error } = await adminClient!
    .from("backoffice_articles")
    .delete()
    .eq("id", id);

  if (error) {
    buildArticlesRedirect(
      "/backoffice/articles",
      error.message || "We couldn’t delete this article right now.",
      "error"
    );
  }

  await deleteArticleTags(article.slug);
  await revalidateArticleSurfaces(article.slug);
  buildArticlesRedirect(
    "/backoffice/articles",
    "Article deleted successfully.",
    "success"
  );
}
