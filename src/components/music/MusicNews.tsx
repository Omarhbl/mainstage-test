"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArticleRecord,
  formatArticleDate,
  getArticleImageStyle,
  getSortedArticleCardsFromRecords,
  hasArticleCategory,
} from "@/lib/articles";
import { usePublicArticles } from "@/lib/use-public-articles";

const INITIAL_VISIBLE_COUNT = 3;

export default function MusicNews({ initialArticles }: { initialArticles?: ArticleRecord[] }) {
  const publicArticles = usePublicArticles();
  const articles = publicArticles.articles.length > 0 ? publicArticles.articles : initialArticles ?? [];
  const articlesMap = Object.fromEntries(
    articles.map((article) => [article.slug, article])
  ) as Record<string, ArticleRecord>;
  const orderedArticles =
    publicArticles.sortedCards.length > 0
      ? publicArticles.sortedCards
          .map((card) => articlesMap[card.slug])
          .filter(Boolean)
      : getSortedArticleCardsFromRecords(articles)
          .map((card) => articlesMap[card.slug])
          .filter(Boolean);
  const musicArticles = orderedArticles.filter((article) =>
    hasArticleCategory(article, "music")
  );
  const [showAllArticles, setShowAllArticles] = useState(false);
  const visibleArticles = showAllArticles
    ? musicArticles
    : musicArticles.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMoreArticles = musicArticles.length > INITIAL_VISIBLE_COUNT;

  return (
    <section className="space-y-11">
      {visibleArticles.map((article) => {
        const articleDate =
          "date" in article && typeof article.date === "string"
            ? article.date
            : "This week";

        return (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}?from=music`}
            className="group grid cursor-pointer items-start gap-7 transition-transform duration-300 hover:-translate-y-1 md:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]"
          >
            <div className="overflow-hidden rounded-[10px] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] transition-shadow duration-300 group-hover:shadow-[0_16px_32px_rgba(0,0,0,0.1)]">
              <img
                src={article.image}
                alt={article.title}
                className={`h-[250px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                  article.imageClassName ?? ""
                }`}
                style={getArticleImageStyle(article)}
              />
            </div>

            <div className="flex h-[250px] overflow-hidden pt-1">
              <div className="flex h-full max-w-[520px] flex-col overflow-hidden">
                <p className="text-[15px] font-body font-normal text-black/50">
                  {formatArticleDate(articleDate)}
                </p>

                <h3
                  className="mt-4 overflow-hidden text-[26px] font-body font-bold leading-[1.08] tracking-[-0.04em] text-[#181818] transition-colors duration-300 group-hover:text-[#CE2127]"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {article.title}
                </h3>

                <p
                  className="mt-5 overflow-hidden text-[16px] font-body font-normal leading-[1.58] text-black/58"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {article.summary}
                </p>
              </div>
            </div>
          </Link>
        );
      })}

      {hasMoreArticles && !showAllArticles ? (
        <div className="mt-16 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAllArticles(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#CE2127] px-7 py-3 text-[13px] font-body font-semibold text-white transition-opacity hover:opacity-90"
          >
            Discover more
          </button>
        </div>
      ) : null}
    </section>
  );
}
