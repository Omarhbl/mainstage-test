"use client";

import { useEffect, useRef, useState } from "react";
import ArticleContent from "@/components/article/ArticleContent";
import type { ArticleRecord } from "@/lib/articles";
import { isRichTextHtml, sanitizeArticleBodyHtml } from "@/lib/article-rich-text";

export default function ArticlePreviewButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const urlsRef = useRef<string[]>([]);
  const [article, setArticle] = useState<ArticleRecord | null>(null);

  function releaseFiles() {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current = [];
  }

  useEffect(() => () => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function preview(form: HTMLFormElement | null) {
    if (!form) return;
    releaseFiles();
    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const media = (name: string, fileName: string) => {
      const file = data.get(fileName);
      if (file instanceof File && file.size > 0) {
        const url = URL.createObjectURL(file);
        urlsRef.current.push(url);
        return url;
      }
      return value(name);
    };
    const image = media("image", "image_file");
    const body = value("body");
    const bottomType = value("bottom_media_type");
    setArticle({
      slug: value("slug"),
      title: value("title") || "Untitled article",
      summary: value("summary"),
      category: value("primary_category"),
      date: value("date_label"),
      image,
      imageCaption: value("image_caption"),
      heroImagePositionX: Number(value("hero_image_position_x") || 50),
      heroImagePositionY: Number(value("hero_image_position_y") || 50),
      bottomImagePositionX: Number(value("bottom_image_position_x") || 50),
      bottomImagePositionY: Number(value("bottom_image_position_y") || 50),
      imagePositionX: Number(value("image_position_x") || 50),
      imagePositionY: Number(value("image_position_y") || 50),
      heroMedia: {
        type: value("hero_media_type") === "video" ? "video" : "image",
        src: media("hero_media_src", "hero_media_file") || image,
      },
      intro: value("intro"),
      body: isRichTextHtml(body) ? [] : body.split(/\n{2,}/).filter(Boolean),
      bodyHtml: isRichTextHtml(body) ? sanitizeArticleBodyHtml(body) : undefined,
      bottomMedia: bottomType === "image" || bottomType === "youtube" ? {
        type: bottomType,
        src: media("bottom_media_src", "bottom_media_file"),
      } : undefined,
      similarSlugs: [],
    });
    dialogRef.current?.showModal();
  }

  return (
    <>
      <button type="button" onClick={(event) => preview(event.currentTarget.form)}
        className="rounded-[12px] border border-black/15 px-5 py-3 font-body text-sm font-semibold hover:bg-black/5">
        Preview article
      </button>
      <dialog ref={dialogRef} aria-labelledby="article-preview-title" onClose={() => { setArticle(null); releaseFiles(); }}
        className="fixed inset-0 m-auto h-[94dvh] max-h-[94dvh] w-[96vw] max-w-[1280px] overflow-y-auto rounded-xl bg-white p-0 text-[#181818] shadow-xl backdrop:bg-black/60">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-black/10 bg-white px-5 py-4">
          <div>
            <h2 id="article-preview-title" className="font-body font-bold">Article preview</h2>
            <p className="text-xs text-black/60">Current edits · Nothing saved or published</p>
          </div>
          <button type="button" onClick={() => dialogRef.current?.close()} className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold">Back to editing</button>
        </div>
        <section className="mx-auto max-w-[1180px] px-4 py-12 md:px-8 md:py-16">
          {article ? <ArticleContent article={article} /> : null}
        </section>
      </dialog>
    </>
  );
}
