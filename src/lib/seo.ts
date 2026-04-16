import type { Metadata } from "next";
import { formatArticleDate } from "@/lib/articles";

export const SITE_NAME = "Mainstagent";
export const SITE_TITLE = "Mainstage | For the Culture. For the Industry";
export const SITE_DESCRIPTION =
  "Mainstage is a platform built for culture, entertainment, and the people shaping what's next.";
export const SITE_LOCALE = "en_US";
export const DEFAULT_OG_IMAGE_PATH = "/mainstage-logo.png";

function normalizeSiteUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "http://localhost:3000";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, "");
  }

  if (trimmed.startsWith("localhost") || trimmed.startsWith("127.0.0.1")) {
    return `http://${trimmed}`.replace(/\/+$/, "");
  }

  return `https://${trimmed}`.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const rawValue =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "http://localhost:3000";

  return normalizeSiteUrl(rawValue);
}

export function toAbsoluteUrl(value = "/") {
  if (!value) {
    return getSiteUrl();
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  return `${getSiteUrl()}${value.startsWith("/") ? value : `/${value}`}`;
}

export function getDefaultOgImage() {
  return toAbsoluteUrl(DEFAULT_OG_IMAGE_PATH);
}

export function buildSeoDescription(...candidates: Array<string | null | undefined>) {
  const source = candidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim().length > 0
  );

  if (!source) {
    return SITE_DESCRIPTION;
  }

  const normalized = source.replace(/\s+/g, " ").trim();

  if (normalized.length <= 160) {
    return normalized;
  }

  return `${normalized.slice(0, 157).trimEnd()}...`;
}

export function parseArticleDateToIso(dateLabel?: string) {
  const normalized = formatArticleDate(dateLabel);
  const displayMatch = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (displayMatch) {
    const [, day, month, year] = displayMatch;
    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      12,
      0,
      0,
      0
    );

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      12,
      0,
      0,
      0
    );

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return undefined;
}

export function buildKeywordList(extra: string[] = []) {
  return Array.from(
    new Set(
      [
        "Mainstage",
        "Morocco",
        "Moroccan culture",
        "music",
        "cinema",
        "events",
        "people",
        "sport",
        "culture",
        ...extra,
      ]
        .map((entry) => entry.trim())
        .filter(Boolean)
    )
  );
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const normalizedDescription = buildSeoDescription(description);
  const imageUrl = getDefaultOgImage();

  return {
    title,
    description: normalizedDescription,
    alternates: {
      canonical: path,
    },
    keywords: buildKeywordList(keywords),
    openGraph: {
      title,
      description: normalizedDescription,
      url: path,
      type: "website",
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      images: [
        {
          url: imageUrl,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: normalizedDescription,
      images: [imageUrl],
    },
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: getSiteUrl(),
    logo: getDefaultOgImage(),
    sameAs: [
      "https://www.instagram.com/themainstagent",
      "https://www.tiktok.com/@themainstagent",
      "https://www.youtube.com/@themainstagent",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "contact@themainstagent.com",
        availableLanguage: ["English", "French"],
      },
    ],
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: getSiteUrl(),
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${getSiteUrl()}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildCollectionPageSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description: buildSeoDescription(description),
    url: toAbsoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: getSiteUrl(),
    },
  };
}

export function buildItemListSchema(
  items: Array<{
    name: string;
    url: string;
  }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function buildBreadcrumbSchema(
  items: Array<{
    name: string;
    url: string;
  }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
