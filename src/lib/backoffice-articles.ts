import { getPublicationWeight } from "@/lib/articles";
import { createSupabaseAdminClient, getArticleTags } from "@/lib/supabase/server";

export const BACKOFFICE_ARTICLE_CATEGORIES = [
  "Music",
  "Cinema",
  "People",
  "Entertainment",
  "Culture",
  "Sport",
] as const;

export function getBackofficeCategoryLabel(category: string) {
  return category === "Entertainment" ? "Events" : category;
}

export const BACKOFFICE_ARTICLE_STATUSES = [
  "draft",
  "review",
  "published",
] as const;

export type BackofficeArticleStatus =
  (typeof BACKOFFICE_ARTICLE_STATUSES)[number];

export type BackofficeArticleCategory =
  (typeof BACKOFFICE_ARTICLE_CATEGORIES)[number];

export type BackofficeArticle = {
  id: string;
  title: string;
  slug: string;
  primary_category: string;
  secondary_categories: string[] | null;
  tags?: string[] | null;
  summary: string;
  intro: string;
  body: string;
  image: string;
  image_caption: string | null;
  hero_media_type: "image" | "video";
  hero_media_src: string;
  bottom_media_type: "none" | "image" | "youtube";
  bottom_media_src: string | null;
  date_label: string;
  status: BackofficeArticleStatus;
  published_by_name?: string | null;
  created_at: string;
  updated_at: string;
};

export const EMPTY_BACKOFFICE_ARTICLE: Omit<
  BackofficeArticle,
  "id" | "created_at" | "updated_at"
> = {
  title: "",
  slug: "",
  primary_category: "Music",
  secondary_categories: [],
  tags: [],
  summary: "",
  intro: "",
  body: "",
  image: "",
  image_caption: "",
  hero_media_type: "image",
  hero_media_src: "",
  bottom_media_type: "none",
  bottom_media_src: "",
  date_label: "",
  status: "draft",
};

export function slugifyArticleTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function displayDateToInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }

  return "";
}

export function inputDateToDisplayValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }

  return trimmed;
}

export function normalizeSecondaryCategories(
  categories: string[],
  primaryCategory: string
) {
  const normalizedPrimary = primaryCategory.toLowerCase();

  return [...new Set(categories)]
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry) => entry.toLowerCase() !== normalizedPrimary);
}

export async function getBackofficeArticles() {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return [] as BackofficeArticle[];
  }

  const [articleTags, { data, error }] = await Promise.all([
    getArticleTags(),
    adminClient
    .from("backoffice_articles")
    .select("*"),
  ]);

  if (error || !data) {
    return [] as BackofficeArticle[];
  }

  return [...(data as BackofficeArticle[])].map((article) => ({
    ...article,
    tags: articleTags[article.slug] ?? [],
  })).sort((left, right) => {
    const leftWeight = getPublicationWeight(left.date_label);
    const rightWeight = getPublicationWeight(right.date_label);

    if (leftWeight !== rightWeight) {
      return leftWeight - rightWeight;
    }

    const leftCreatedAt = new Date(left.created_at).getTime();
    const rightCreatedAt = new Date(right.created_at).getTime();

    if (!Number.isNaN(leftCreatedAt) && !Number.isNaN(rightCreatedAt)) {
      return rightCreatedAt - leftCreatedAt;
    }

    return left.title.localeCompare(right.title);
  });
}

export async function getBackofficeArticleById(id: string) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return null;
  }

  const [articleTags, { data, error }] = await Promise.all([
    getArticleTags(),
    adminClient
    .from("backoffice_articles")
    .select("*")
    .eq("id", id)
    .maybeSingle(),
  ]);

  if (error || !data) {
    return null;
  }

  return {
    ...(data as BackofficeArticle),
    tags: articleTags[(data as BackofficeArticle).slug] ?? [],
  };
}

export function sanitizeStorageFileName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
