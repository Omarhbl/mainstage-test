"use client";

import ResponsiveImage from "@/components/media/ResponsiveImage";
import { useState } from "react";
import { getArticleImageStyle, type ArticleCard } from "@/lib/articles";

type ArticleMediaProps = {
  priority?: boolean;
  src: string;
  alt: string;
  className?: string;
  heightClassName?: string;
  articleImage?: Pick<ArticleCard, "imagePositionX" | "imagePositionY">;
};

export default function ArticleMedia({
  priority = false,
  src,
  alt,
  className = "",
  heightClassName = "h-[430px]",
  articleImage,
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
    <ResponsiveImage
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      src={src}
      alt={alt}
      className={`${heightClassName} w-full object-cover ${className}`.trim()}
      style={articleImage ? getArticleImageStyle(articleImage) : undefined}
      onError={() => setHasError(true)}
    />
  );
}
