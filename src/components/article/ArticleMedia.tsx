"use client";

import { useState } from "react";
import { getArticleImageStyle, type ArticleCard } from "@/lib/articles";

type ArticleMediaProps = {
  src: string;
  alt: string;
  className?: string;
  heightClassName?: string;
  fit?: "cover" | "natural";
  articleImage?: Pick<ArticleCard, "imagePositionX" | "imagePositionY">;
};

export default function ArticleMedia({
  src,
  alt,
  className = "",
  heightClassName = "h-[430px]",
  articleImage,
  fit = "cover",
}: ArticleMediaProps) {
  const [hasError, setHasError] = useState(false);

  if (!src.trim() || hasError) {
    return (
      <div
        className={`${heightClassName} flex w-full items-center justify-center bg-[#ece6df] px-6 text-center text-[14px] font-body font-medium text-black/45`}
      >
        Media unavailable for this article.
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={
        fit === "natural"
          ? "block h-auto w-full"
          : `${heightClassName} w-full object-cover ${className}`.trim()
      }
      style={fit === "cover" && articleImage ? getArticleImageStyle(articleImage) : undefined}
      onError={() => setHasError(true)}
    />
  );
}
