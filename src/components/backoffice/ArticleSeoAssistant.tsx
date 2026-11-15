"use client";

import { useEffect, useRef, useState } from "react";
import { buildSeoDescription } from "@/lib/seo";
import type { ArticleSeoSettings } from "@/lib/article-seo-settings";

type RelatedArticle = { title: string; slug: string; category: string; tags?: string[] };
type Draft = { title: string; summary: string; slug: string; intro: string; body: string; category: string };
const emptyDraft: Draft = { title: "", summary: "", slug: "", intro: "", body: "", category: "" };
const fieldClass = "mt-2 w-full rounded-xl border border-black/15 bg-[#faf8f6] px-3 py-2 text-sm outline-none focus:border-[#CE2127]";

export default function ArticleSeoAssistant({ initial, relatedArticles }: { initial: ArticleSeoSettings; relatedArticles: RelatedArticle[] }) {
  const root = useRef<HTMLElement>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [image, setImage] = useState<{ src: string; width: number; height: number; failed: boolean }>({ src: "", width: 0, height: 0, failed: false });
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const form = root.current?.closest("form");
    if (!form) return;
    let imageSource = "";
    let objectUrl = "";
    let uploadedFile: File | undefined;
    let pendingImage: HTMLImageElement | undefined;
    let disposed = false;
    function update() {
      const data = new FormData(form!);
      const value = (name: string) => String(data.get(name) ?? "").trim();
      // Read the rich-text editor directly: its hidden field can update after the input event.
      const body = form!.querySelector<HTMLElement>('[contenteditable="true"]')?.innerHTML || value("body");
      setDraft({ title: value("title"), summary: value("summary"), slug: value("slug"), intro: value("intro"), body, category: value("primary_category") });
      const file = data.get("image_file");
      let src = value("image");
      if (file instanceof File && file.size) {
        if (uploadedFile !== file) {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          objectUrl = URL.createObjectURL(file);
          uploadedFile = file;
        }
        src = objectUrl;
      }
      if (imageSource === src) return;
      imageSource = src;
      if (pendingImage) { pendingImage.onload = null; pendingImage.onerror = null; }
      setImage({ src, width: 0, height: 0, failed: false });
      if (!src) return;
      const probe = new Image();
      pendingImage = probe;
      probe.onload = () => { if (!disposed && imageSource === src) setImage({ src, width: probe.naturalWidth, height: probe.naturalHeight, failed: false }); };
      probe.onerror = () => { if (!disposed && imageSource === src) setImage({ src, width: 0, height: 0, failed: true }); };
      probe.src = src;
    }
    update();
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    return () => {
      disposed = true;
      form.removeEventListener("input", update);
      form.removeEventListener("change", update);
      if (pendingImage) { pendingImage.onload = null; pendingImage.onerror = null; }
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const searchTitle = title.trim() || draft.title || "Your article headline";
  const searchDescription = buildSeoDescription(description.trim(), draft.summary, "Your article summary will appear here.");
  const slug = draft.slug || draft.title.toLowerCase().trim().replace(/['’"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const links = Array.from(draft.body.matchAll(/href=["']([^"']+)["']/gi), (match) => match[1]);
  const isInternal = (url: string) => /^\/(?!\/)/.test(url) || /^https?:\/\/(www\.)?themainstagent\.com(?:\/|$)/i.test(url);
  const internalLinks = links.filter(isInternal);
  const externalLinks = links.filter((url) => /^https?:\/\//i.test(url) && !isInternal(url));
  const terms = new Set(`${draft.title} ${draft.summary}`.toLowerCase().match(/[\p{L}\p{N}]{4,}/gu) ?? []);
  const suggestions = relatedArticles.map((article) => ({ ...article, relevance: (article.title.toLowerCase().match(/[\p{L}\p{N}]{4,}/gu) ?? []).filter((term) => terms.has(term)).length + (article.category === draft.category ? 0.5 : 0) }))
    .filter((article) => article.slug !== slug && article.relevance >= 1 && !internalLinks.some((url) => url.split(/[?#]/)[0].endsWith(`/articles/${article.slug}`)))
    .sort((a, b) => b.relevance - a.relevance).slice(0, 3);
  const checks = [
    { ok: !!draft.title, text: draft.title ? "Headline entered. Check that it names the subject and clearly states the news." : "Add a clear headline naming the subject of the story." },
    { ok: !!draft.intro, text: draft.intro ? "Opening paragraph entered. Confirm it answers who, what, where and when." : "Add an opening paragraph with the essential news." },
    { ok: !!draft.summary, text: draft.summary ? "Summary entered for listings and the default search description." : "Add a useful, unique summary." },
    { ok: image.width >= 1200, text: !image.src ? "Add a cover image; aim for at least 1,200 pixels wide." : image.failed ? "Image could not be checked. Verify the image link or upload a file." : !image.width ? "Checking cover image dimensions…" : `Cover: ${image.width} × ${image.height}px.${image.width >= 1200 ? " Suitable width for a large preview." : " Use an original at least 1,200px wide when available."}` },
    { ok: internalLinks.length > 0, text: internalLinks.length ? `${internalLinks.length} internal link(s) found. Check they help the reader.` : "Add a relevant link to earlier Mainstage coverage when useful." },
    { ok: externalLinks.length > 0, text: externalLinks.length ? `${externalLinks.length} external link(s) found. Verify the sources support your claims.` : "Link to the original announcement or other evidence when appropriate." },
  ];

  return <section ref={root} aria-labelledby="article-seo-heading" className="rounded-[20px] border border-black/10 bg-white p-6 shadow-sm">
    <h2 id="article-seo-heading" className="text-xl font-bold">Search & SEO assistant</h2>
    <p className="mt-2 text-sm leading-relaxed text-black/65">Prepare a clear search appearance. These checks are guidance, not a ranking score or a publishing requirement.</p>
    <label className="mt-5 block text-sm font-medium">SEO title (optional)
      <input name="seo_title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} placeholder="Uses your article headline" className={fieldClass} />
    </label>
    <p className="mt-1 text-xs text-black/65">{(title.trim() || draft.title).length} characters before the Mainstage suffix. Around 50–60 is a useful editing guide, not a Google limit.</p>
    <label className="mt-4 block text-sm font-medium">Search description (optional)
      <textarea name="seo_description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} placeholder="Uses your article summary" rows={4} className={fieldClass} />
    </label>
    <p className="mt-1 text-xs text-black/65">{(description.trim() || draft.summary).length} characters. Aim for a concise, accurate summary; Google may choose different text.</p>
    <div className="mt-5 rounded-xl border border-black/10 p-3 break-words" aria-label="Approximate Google search preview">
      <p className="text-xs text-black/65">themainstagent.com › articles › {slug || "your-story"}</p>
      <p className="mt-2 text-lg leading-snug text-[#1a0dab]">{searchTitle} | Mainstage</p>
      <p className="mt-1 text-sm leading-relaxed text-[#474747]">{searchDescription}</p>
    </div>
    <p className="mt-2 text-xs text-black/60">Approximate preview. Google can rewrite or shorten titles and descriptions.</p>
    <h3 className="mt-5 font-semibold">Before publishing</h3>
    <ul className="mt-3 space-y-3 text-sm leading-relaxed">{checks.map((check) => <li key={check.text} className="flex gap-2"><span aria-label={check.ok ? "Present" : "Review"} className={check.ok ? "text-[#086b3b]" : "text-[#865200]"}>{check.ok ? "✓" : "○"}</span><span>{check.text}</span></li>)}</ul>
    <p className="mt-4 text-sm leading-relaxed text-black/70">Editorial review: verify the facts, original reporting, image rights and attribution. Articles currently show the Mainstage Editorial byline; credit individual contributors in the story where appropriate.</p>
    <h3 className="mt-5 font-semibold">Related-link ideas</h3>
    <p className="mt-1 text-xs leading-relaxed text-black/65">Suggestions use shared words and section. Review relevance, then add the link using the body editor’s link tool.</p>
    {suggestions.length ? <ul className="mt-3 space-y-3">{suggestions.map((article) => <li key={article.slug} className="rounded-lg border border-black/10 p-3 text-sm"><a href={`/articles/${article.slug}`} target="_blank" rel="noopener noreferrer" className="font-medium underline">{article.title}</a><button type="button" className="mt-2 block font-semibold text-[#a51b20]" onClick={async () => { try { await navigator.clipboard.writeText(`https://www.themainstagent.com/articles/${article.slug}`); setCopied(article.slug); } catch { setCopied("failed"); } }}>{copied === article.slug ? "Link copied" : "Copy link"}</button></li>)}</ul> : <p className="mt-3 text-sm text-black/65">No close matches yet. Add your headline and section, or choose relevant coverage yourself.</p>}
    <p role="status" className="mt-2 text-xs text-black/65">{copied === "failed" ? "Copy was unavailable. Open the suggested article and copy its address." : copied ? "Link copied. Select relevant words in the body and use the link tool." : ""}</p>
    <p className="mt-4 text-xs text-black/65">SEO fields save with the article. Leave them blank to keep automatic defaults.</p>
  </section>;
}
