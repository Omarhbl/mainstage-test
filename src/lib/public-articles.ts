import "server-only";

import {
  ArticleRecord,
  articlesBySlug as fallbackArticlesBySlug,
  getPublicationWeight,
  getSortedArticleCardsFromRecords,
  searchArticlesInRecords,
} from "@/lib/articles";
import { isRichTextHtml, sanitizeArticleBodyHtml } from "@/lib/article-rich-text";
import {
  createSupabaseAdminClient,
  getArticleImageOverrides,
  getArticleTags,
} from "@/lib/supabase/server";

type BackofficePublicRow = {
  slug: string;
  title: string;
  primary_category: string;
  secondary_categories: string[] | null;
    summary: string;
    intro: string;
    body: string;
    tags?: string[] | null;
    image: string;
  image_caption: string | null;
  hero_media_type: "image" | "video";
  hero_media_src: string;
  bottom_media_type: "none" | "image" | "youtube";
  bottom_media_src: string | null;
  date_label: string;
  status: "draft" | "review" | "published";
  created_at: string;
  updated_at: string;
};

function toArticleRecord(
  row: BackofficePublicRow,
  imageOverrides: Awaited<ReturnType<typeof getArticleImageOverrides>>,
  articleTags: Awaited<ReturnType<typeof getArticleTags>>
): ArticleRecord {
  const override = imageOverrides[row.slug];

  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    category: row.primary_category,
    categories: row.secondary_categories ?? [],
    tags: articleTags[row.slug] ?? row.tags ?? [],
    image: row.image,
    imagePositionX: override?.imagePositionX,
    imagePositionY: override?.imagePositionY,
    date: row.date_label,
    imageCaption: row.image_caption ?? undefined,
    intro: row.intro,
    body: row.body
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
    bodyHtml: isRichTextHtml(row.body) ? sanitizeArticleBodyHtml(row.body) : undefined,
    heroMedia: {
      type: row.hero_media_type,
      src: row.hero_media_src,
    },
    bottomMedia:
      row.bottom_media_type === "none" || !row.bottom_media_src
        ? undefined
        : {
            type: row.bottom_media_type,
            src: row.bottom_media_src,
          },
    similarSlugs: [],
  };
}

function sortRecordsByPublication(records: ArticleRecord[]) {
  return [...records].sort((left, right) => {
    const leftWeight = getPublicationWeight(left.date);
    const rightWeight = getPublicationWeight(right.date);

    if (leftWeight !== rightWeight) {
      return leftWeight - rightWeight;
    }

    return 0;
  });
}

export async function getPublicArticles(): Promise<ArticleRecord[]> {
  const adminClient = createSupabaseAdminClient();
  const [imageOverrides, articleTags] = await Promise.all([
    getArticleImageOverrides(),
    getArticleTags(),
  ]);

  if (!adminClient) {
    return sortRecordsByPublication(Object.values(fallbackArticlesBySlug));
  }

  const { data, error } = await adminClient
    .from("backoffice_articles")
    .select(
      "slug,title,primary_category,secondary_categories,summary,intro,body,image,image_caption,hero_media_type,hero_media_src,bottom_media_type,bottom_media_src,date_label,status,created_at,updated_at"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return sortRecordsByPublication(Object.values(fallbackArticlesBySlug));
  }

  return sortRecordsByPublication((data as BackofficePublicRow[]).map((row) =>
    toArticleRecord(row, imageOverrides, articleTags)
  ));
}

export async function getPublicArticlesBySlug() {
  const articles = await getPublicArticles();

  return Object.fromEntries(articles.map((article) => [article.slug, article])) as Record<
    string,
    ArticleRecord
  >;
}

export async function getSortedPublicArticleCards() {
  const articles = await getPublicArticles();
  return getSortedArticleCardsFromRecords(articles);
}

export async function getPublicArticleBySlug(slug: string) {
  const articles = await getPublicArticlesBySlug();
  return articles[slug] ?? null;
}

export async function searchPublicArticles(query: string) {
  const articles = await getPublicArticles();
  return searchArticlesInRecords(articles, query);
}
