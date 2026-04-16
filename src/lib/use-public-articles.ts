"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArticleRecord,
  articlesBySlug as fallbackArticlesBySlug,
  getSortedArticleCardsFromRecords,
} from "@/lib/articles";

export function usePublicArticles() {
  const [articles, setArticles] = useState<ArticleRecord[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadArticles() {
      try {
        const response = await fetch("/api/public-articles", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          articles?: ArticleRecord[];
        };

        if (isMounted && Array.isArray(payload.articles) && payload.articles.length > 0) {
          setArticles(payload.articles);
        }
      } catch {
        // Keep fallback data in place if the request fails.
      }
    }

    loadArticles();

    return () => {
      isMounted = false;
    };
  }, []);

  const articlesMap = useMemo(
    () =>
      Object.fromEntries(articles.map((article) => [article.slug, article])) as Record<
        string,
        ArticleRecord
      >,
    [articles]
  );

  const sortedCards = useMemo(
    () => getSortedArticleCardsFromRecords(articles),
    [articles]
  );

  return {
    articles,
    articlesMap,
    sortedCards,
  };
}
