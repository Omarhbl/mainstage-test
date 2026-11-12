"use client";

import { useEffect, useRef } from "react";

type ArticleRichContentProps = {
  html: string;
};

export default function ArticleRichContent({ html }: ArticleRichContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const images = Array.from(container.querySelectorAll("img"));
    const cleanups: Array<() => void> = [];

    images.forEach((image) => {
      const handleError = () => {
        const figure = image.closest("figure.article-inline-image");

        if (figure instanceof HTMLElement) {
          figure.innerHTML =
            '<div class="article-inline-fallback">Image unavailable for this article.</div>';
          return;
        }

        image.replaceWith(document.createTextNode(""));
      };

      image.addEventListener("error", handleError);
      cleanups.push(() => image.removeEventListener("error", handleError));

      if (image.complete && (!image.naturalWidth || !image.naturalHeight)) {
        handleError();
      }
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [html]);

  return (
    <div
      ref={containerRef}
      className="article-rich-content mt-7 text-[15px] font-body font-normal leading-[2] text-[rgba(0,0,0,0.74)]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
