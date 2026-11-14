import { normalizeArticleAd, type ArticleAdSettings } from "@/lib/article-ad";

export default function ArticleAd({ settings }: { settings: ArticleAdSettings }) {
  const ad = normalizeArticleAd(settings);
  if (!ad.enabled) return null;
  const artwork = <picture>
    <source media="(max-width: 767px)" srcSet={ad.mobileImage} />
    <img src={ad.desktopImage} alt="Advertisement" loading="lazy" decoding="async" width={1200} height={628} className="block aspect-square h-auto w-full object-contain md:aspect-[1200/628]" />
  </picture>;
  return <aside aria-label="Advertisement" className="mx-auto my-12 max-w-[360px] md:my-16 md:max-w-[728px]">
    <p className="mb-3 text-center text-[11px] font-body tracking-[0.14em] text-black/50">ADVERTISEMENT</p>
    {ad.href ? <a href={ad.href} target="_blank" rel="sponsored noopener noreferrer" className="block">{artwork}</a> : artwork}
  </aside>;
}
