import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import {
  FALLBACK_ENTERTAINMENT_UPCOMING,
  UPCOMING_RELEASES,
  type UpcomingItem,
  type UpcomingSettings,
} from "@/lib/upcoming";
import {
  FALLBACK_BACKSTAGE_CLIENTS,
  FALLBACK_BACKSTAGE_PORTAL_SETTINGS,
  type BackstageClientAccount,
  type BackstagePortalSettings,
  type PartnerApproval,
  type PartnerCampaign,
  type PartnerFile,
  type PartnerLogEntry,
  type PartnerMessage,
  type PartnerReport,
} from "@/lib/backstage-portal";
import {
  FALLBACK_SITE_SETTINGS,
  type SiteSettings,
} from "@/lib/site-settings";

export type DashboardEditorialNote = {
  title: string;
  message: string;
  updatedAt: string;
};

export type HomepageSettings = {
  heroSlides: Array<{
    title: string;
    category: string;
    href: string;
    media: string;
  }>;
  heroTitle: string;
  heroCategory: string;
  heroHref: string;
  heroMedia: string;
  tickerItems: Array<{
    title: string;
    href: string;
  }>;
  mustReadSlug: string;
  bannerImage: string;
  bannerHref: string;
  socialItems: Array<{
    image: string;
    href: string;
  }>;
};

export type ArticleImageOverride = {
  imagePositionX: number;
  imagePositionY: number;
};

export type ArticleImageOverrides = Record<string, ArticleImageOverride>;
export type ArticleTagMap = Record<string, string[]>;

export type GuestlistSignup = {
  email: string;
  source: string;
  status: string;
  subscribedAt: string;
};

export type ContactMessage = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  source: string;
  status: string;
  receivedAt: string;
};

const fallbackDashboardEditorialNote: DashboardEditorialNote = {
  title: "Today's priority",
  message:
    "Keep the homepage focused on the latest published stories and make sure featured placements stay aligned with the current campaign and editorial priorities.",
  updatedAt: "11/04/2026",
};

const fallbackHomepageSettings: HomepageSettings = {
  heroSlides: [
    {
      title: "Inside Kanye West's Most Controversial Show Yet in LA",
      category: "Music",
      href: "/articles/inside-kanye-wests-most-controversial-show-yet-in-la",
      media: "/videos/intro.mp4",
    },
  ],
  heroTitle: "Inside Kanye West's Most Controversial Show Yet in LA",
  heroCategory: "Music",
  heroHref: "/articles/inside-kanye-wests-most-controversial-show-yet-in-la",
  heroMedia: "/videos/intro.mp4",
  tickerItems: [
    {
      title: "Inside Kanye West's Most Controversial Show Yet in LA",
      href: "/articles/inside-kanye-wests-most-controversial-show-yet-in-la",
    },
    {
      title: "Michael, The King of Pop Returns to the Big Screen",
      href: "/articles/michael-the-king-of-pop-returns-to-the-big-screen",
    },
    {
      title: "Shobee, A comeback that feels intentional",
      href: "/articles/shobee-a-comeback-that-feels-intentional",
    },
    {
      title: "Casablanca en Scène : A night of laughter",
      href: "/articles/casablanca-en-scene-a-night-of-laughter",
    },
    {
      title: "Bad Bunny Isn't Just a Star, He's the Blueprint",
      href: "/articles/bad-bunny-isnt-just-a-star-hes-the-blueprint",
    },
  ],
  mustReadSlug: "inkonnu-split-turns-fragmentation-into-a-language-of-its-own",
  bannerImage: "/home-banner-ad.png",
  bannerHref: "",
  socialItems: [
    { image: "/social/2.png", href: "" },
    { image: "/social/11.png", href: "" },
    { image: "/social/3.png", href: "" },
    { image: "/social/15.png", href: "" },
    { image: "/social/18.png", href: "" },
  ],
};

const fallbackUpcomingSettings: UpcomingSettings = {
  cinema: UPCOMING_RELEASES,
  entertainment: FALLBACK_ENTERTAINMENT_UPCOMING,
};

function normalizeGuestlistEntries(value: unknown): GuestlistSignup[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const record = entry as Partial<GuestlistSignup>;
      const email =
        typeof record.email === "string" ? record.email.trim().toLowerCase() : "";

      if (!email) {
        return null;
      }

      return {
        email,
        source:
          typeof record.source === "string" && record.source.trim()
            ? record.source.trim()
            : "footer_guestlist",
        status:
          typeof record.status === "string" && record.status.trim()
            ? record.status.trim()
            : "active",
        subscribedAt:
          typeof record.subscribedAt === "string" && record.subscribedAt.trim()
            ? record.subscribedAt.trim()
            : new Date().toISOString(),
      };
    })
    .filter(Boolean) as GuestlistSignup[];
}

function sortGuestlistEntries(entries: GuestlistSignup[]) {
  return [...entries].sort((left, right) => {
    const leftTime = new Date(left.subscribedAt).getTime();
    const rightTime = new Date(right.subscribedAt).getTime();

    if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
      return right.email.localeCompare(left.email);
    }

    return rightTime - leftTime;
  });
}

function normalizeContactMessages(value: unknown): ContactMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const record = entry as Partial<ContactMessage>;
      const email =
        typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
      const subject =
        typeof record.subject === "string" ? record.subject.trim() : "";
      const message =
        typeof record.message === "string" ? record.message.trim() : "";

      if (!email || !subject || !message) {
        return null;
      }

      return {
        firstName:
          typeof record.firstName === "string" ? record.firstName.trim() : "",
        lastName:
          typeof record.lastName === "string" ? record.lastName.trim() : "",
        email,
        phone: typeof record.phone === "string" ? record.phone.trim() : "",
        subject,
        message,
        source:
          typeof record.source === "string" && record.source.trim()
            ? record.source.trim()
            : "website_contact",
        status:
          typeof record.status === "string" && record.status.trim()
            ? record.status.trim()
            : "new",
        receivedAt:
          typeof record.receivedAt === "string" && record.receivedAt.trim()
            ? record.receivedAt.trim()
            : new Date().toISOString(),
      };
    })
    .filter(Boolean) as ContactMessage[];
}

function sortContactMessages(entries: ContactMessage[]) {
  return [...entries].sort((left, right) => {
    const leftTime = new Date(left.receivedAt).getTime();
    const rightTime = new Date(right.receivedAt).getTime();

    if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
      return right.email.localeCompare(left.email);
    }

    return rightTime - leftTime;
  });
}

function clampImagePosition(value: unknown, fallback = 50) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, value));
}

function normalizeArticleTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value
        .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
        .filter(Boolean)
    ),
  ];
}

function sanitizeUpcomingItem(
  item: unknown,
  fallback: UpcomingItem,
  index: number,
  prefix: string
): UpcomingItem {
  if (!item || typeof item !== "object") {
    return fallback;
  }

  const value = item as Partial<UpcomingItem>;

  return {
    id:
      typeof value.id === "string" && value.id.trim()
        ? value.id.trim()
        : `${prefix}-${index + 1}`,
    title:
      typeof value.title === "string" && value.title.trim()
        ? value.title.trim()
        : fallback.title,
    releaseDate:
      typeof value.releaseDate === "string" && value.releaseDate.trim()
        ? value.releaseDate.trim()
        : fallback.releaseDate,
    image:
      typeof value.image === "string" && value.image.trim()
        ? value.image.trim()
        : fallback.image,
    overview:
      typeof value.overview === "string" && value.overview.trim()
        ? value.overview.trim()
        : fallback.overview,
    href:
      typeof value.href === "string"
        ? value.href.trim()
        : fallback.href,
  };
}

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export type SupabaseSessionScope = "team" | "client";

function getSupabaseCookieName(scope: SupabaseSessionScope) {
  return scope === "client"
    ? "sb-mainstage-client-auth"
    : "sb-mainstage-team-auth";
}

export async function createSupabaseServerClient(
  scope: SupabaseSessionScope = "team"
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      name: getSupabaseCookieName(scope),
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Cookie writes can fail in some render contexts. In those cases,
          // Supabase still works for read-only session checks.
        }
      },
    },
  });
}

export function hasSupabaseServiceRoleEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function getDashboardEditorialNote() {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return fallbackDashboardEditorialNote;
  }

  const { data, error } = await adminClient
    .from("site_settings")
    .select("value, updated_at")
    .eq("key", "dashboard_editorial_note")
    .maybeSingle();

  if (error || !data?.value || typeof data.value !== "object") {
    return fallbackDashboardEditorialNote;
  }

  const value = data.value as Partial<DashboardEditorialNote>;

  return {
    title:
      typeof value.title === "string" && value.title.trim()
        ? value.title.trim()
        : fallbackDashboardEditorialNote.title,
    message:
      typeof value.message === "string" && value.message.trim()
        ? value.message.trim()
        : fallbackDashboardEditorialNote.message,
    updatedAt:
      typeof value.updatedAt === "string" && value.updatedAt.trim()
        ? value.updatedAt.trim()
        : fallbackDashboardEditorialNote.updatedAt,
  };
}

export async function getHomepageSettings() {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return fallbackHomepageSettings;
  }

  const { data, error } = await adminClient
    .from("site_settings")
    .select("value")
    .eq("key", "homepage_settings")
    .maybeSingle();

  if (error || !data?.value || typeof data.value !== "object") {
    return fallbackHomepageSettings;
  }

  const value = data.value as Partial<HomepageSettings>;
  const parsedHeroSlides = Array.isArray(value.heroSlides)
    ? value.heroSlides
        .map((item, index) => ({
          title:
            item &&
            typeof item === "object" &&
            "title" in item &&
            typeof item.title === "string" &&
            item.title.trim()
              ? item.title.trim()
              : fallbackHomepageSettings.heroSlides[index]?.title ??
                fallbackHomepageSettings.heroSlides[0].title,
          category:
            item &&
            typeof item === "object" &&
            "category" in item &&
            typeof item.category === "string" &&
            item.category.trim()
              ? item.category.trim()
              : fallbackHomepageSettings.heroSlides[index]?.category ??
                fallbackHomepageSettings.heroSlides[0].category,
          href:
            item &&
            typeof item === "object" &&
            "href" in item &&
            typeof item.href === "string" &&
            item.href.trim()
              ? item.href.trim()
              : fallbackHomepageSettings.heroSlides[index]?.href ??
                fallbackHomepageSettings.heroSlides[0].href,
          media:
            item &&
            typeof item === "object" &&
            "media" in item &&
            typeof item.media === "string" &&
            item.media.trim()
              ? item.media.trim()
              : fallbackHomepageSettings.heroSlides[index]?.media ??
                fallbackHomepageSettings.heroSlides[0].media,
        }))
        .filter((item) => item.title && item.category && item.href && item.media)
    : [];
  const heroSlides =
    parsedHeroSlides.length > 0 ? parsedHeroSlides : fallbackHomepageSettings.heroSlides;
  const firstHeroSlide = heroSlides[0];

  return {
    heroSlides,
    heroTitle:
      firstHeroSlide.title,
    heroCategory:
      firstHeroSlide.category,
    heroHref:
      firstHeroSlide.href,
    heroMedia:
      firstHeroSlide.media,
    tickerItems: Array.isArray(value.tickerItems)
      ? value.tickerItems
          .map((item, index) => ({
            title:
              item &&
              typeof item === "object" &&
              "title" in item &&
              typeof item.title === "string" &&
              item.title.trim()
                ? item.title.trim()
                : fallbackHomepageSettings.tickerItems[index]?.title ??
                  fallbackHomepageSettings.tickerItems[0].title,
            href:
              item &&
              typeof item === "object" &&
              "href" in item &&
              typeof item.href === "string" &&
              item.href.trim()
                ? item.href.trim()
                : fallbackHomepageSettings.tickerItems[index]?.href ??
                  fallbackHomepageSettings.tickerItems[0].href,
          }))
      : fallbackHomepageSettings.tickerItems,
    mustReadSlug:
      typeof value.mustReadSlug === "string" && value.mustReadSlug.trim()
        ? value.mustReadSlug.trim()
        : fallbackHomepageSettings.mustReadSlug,
    bannerImage:
      typeof value.bannerImage === "string" && value.bannerImage.trim()
        ? value.bannerImage.trim()
        : fallbackHomepageSettings.bannerImage,
    bannerHref:
      typeof value.bannerHref === "string" ? value.bannerHref.trim() : "",
    socialItems: Array.isArray(value.socialItems)
      ? value.socialItems
          .slice(0, 5)
          .map((item, index) => ({
            image:
              item &&
              typeof item === "object" &&
              "image" in item &&
              typeof item.image === "string" &&
              item.image.trim()
                ? item.image.trim()
                : fallbackHomepageSettings.socialItems[index]?.image ??
                  fallbackHomepageSettings.socialItems[0].image,
            href:
              item &&
              typeof item === "object" &&
              "href" in item &&
              typeof item.href === "string"
                ? item.href.trim()
                : "",
          }))
      : fallbackHomepageSettings.socialItems,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return FALLBACK_SITE_SETTINGS;
  }

  const { data, error } = await adminClient
    .from("site_settings")
    .select("value")
    .eq("key", "site_config")
    .maybeSingle();

  if (error || !data?.value || typeof data.value !== "object" || Array.isArray(data.value)) {
    return FALLBACK_SITE_SETTINGS;
  }

  const value = data.value as Partial<SiteSettings>;

  return {
    contactEmail:
      typeof value.contactEmail === "string" && value.contactEmail.trim()
        ? value.contactEmail.trim()
        : FALLBACK_SITE_SETTINGS.contactEmail,
    instagramUrl:
      typeof value.instagramUrl === "string" && value.instagramUrl.trim()
        ? value.instagramUrl.trim()
        : FALLBACK_SITE_SETTINGS.instagramUrl,
    youtubeUrl:
      typeof value.youtubeUrl === "string" && value.youtubeUrl.trim()
        ? value.youtubeUrl.trim()
        : FALLBACK_SITE_SETTINGS.youtubeUrl,
    tiktokUrl:
      typeof value.tiktokUrl === "string" && value.tiktokUrl.trim()
        ? value.tiktokUrl.trim()
        : FALLBACK_SITE_SETTINGS.tiktokUrl,
    aboutPage:
      value.aboutPage && typeof value.aboutPage === "object" && !Array.isArray(value.aboutPage)
        ? {
            title:
              typeof value.aboutPage.title === "string" && value.aboutPage.title.trim()
                ? value.aboutPage.title.trim()
                : FALLBACK_SITE_SETTINGS.aboutPage.title,
            introContent:
              typeof value.aboutPage.introContent === "string" &&
              value.aboutPage.introContent.trim()
                ? value.aboutPage.introContent
                : FALLBACK_SITE_SETTINGS.aboutPage.introContent,
            signature:
              typeof value.aboutPage.signature === "string" &&
              value.aboutPage.signature.trim()
                ? value.aboutPage.signature.trim()
                : FALLBACK_SITE_SETTINGS.aboutPage.signature,
            coverageTitle:
              typeof value.aboutPage.coverageTitle === "string" &&
              value.aboutPage.coverageTitle.trim()
                ? value.aboutPage.coverageTitle.trim()
                : FALLBACK_SITE_SETTINGS.aboutPage.coverageTitle,
            coverageSubtitle:
              typeof value.aboutPage.coverageSubtitle === "string" &&
              value.aboutPage.coverageSubtitle.trim()
                ? value.aboutPage.coverageSubtitle.trim()
                : FALLBACK_SITE_SETTINGS.aboutPage.coverageSubtitle,
            coverageItems: Array.isArray(value.aboutPage.coverageItems)
              ? value.aboutPage.coverageItems
                  .slice(0, 6)
                  .map((item, index) => ({
                    title:
                      item &&
                      typeof item === "object" &&
                      "title" in item &&
                      typeof item.title === "string" &&
                      item.title.trim()
                        ? item.title.trim()
                        : FALLBACK_SITE_SETTINGS.aboutPage.coverageItems[index]?.title ??
                          FALLBACK_SITE_SETTINGS.aboutPage.coverageItems[0].title,
                    description:
                      item &&
                      typeof item === "object" &&
                      "description" in item &&
                      typeof item.description === "string" &&
                      item.description.trim()
                        ? item.description.trim()
                        : FALLBACK_SITE_SETTINGS.aboutPage.coverageItems[index]?.description ??
                          FALLBACK_SITE_SETTINGS.aboutPage.coverageItems[0].description,
                    image:
                      item &&
                      typeof item === "object" &&
                      "image" in item &&
                      typeof item.image === "string" &&
                      item.image.trim()
                        ? item.image.trim()
                        : FALLBACK_SITE_SETTINGS.aboutPage.coverageItems[index]?.image ??
                          FALLBACK_SITE_SETTINGS.aboutPage.coverageItems[0].image,
                  }))
              : FALLBACK_SITE_SETTINGS.aboutPage.coverageItems,
          }
        : FALLBACK_SITE_SETTINGS.aboutPage,
    footerTagline:
      typeof value.footerTagline === "string" && value.footerTagline.trim()
        ? value.footerTagline.trim()
        : FALLBACK_SITE_SETTINGS.footerTagline,
    copyrightText:
      typeof value.copyrightText === "string" && value.copyrightText.trim()
        ? value.copyrightText.trim()
        : FALLBACK_SITE_SETTINGS.copyrightText,
    legalLinks: Array.isArray(value.legalLinks)
      ? value.legalLinks
          .slice(0, 4)
          .map((item, index) => ({
            label:
              item &&
              typeof item === "object" &&
              "label" in item &&
              typeof item.label === "string" &&
              item.label.trim()
                ? item.label.trim()
                : FALLBACK_SITE_SETTINGS.legalLinks[index]?.label ??
                  FALLBACK_SITE_SETTINGS.legalLinks[0].label,
            href:
              item &&
              typeof item === "object" &&
              "href" in item &&
              typeof item.href === "string" &&
              item.href.trim()
                ? item.href.trim()
                : FALLBACK_SITE_SETTINGS.legalLinks[index]?.href ??
                  FALLBACK_SITE_SETTINGS.legalLinks[0].href,
          }))
      : FALLBACK_SITE_SETTINGS.legalLinks,
    legalPages:
      value.legalPages && typeof value.legalPages === "object" && !Array.isArray(value.legalPages)
        ? {
            terms: {
              title:
                typeof value.legalPages.terms?.title === "string" &&
                value.legalPages.terms.title.trim()
                  ? value.legalPages.terms.title.trim()
                  : FALLBACK_SITE_SETTINGS.legalPages.terms.title,
              effectiveDate:
                typeof value.legalPages.terms?.effectiveDate === "string"
                  ? value.legalPages.terms.effectiveDate.trim()
                  : FALLBACK_SITE_SETTINGS.legalPages.terms.effectiveDate,
              content:
                typeof value.legalPages.terms?.content === "string" &&
                value.legalPages.terms.content.trim()
                  ? value.legalPages.terms.content
                  : FALLBACK_SITE_SETTINGS.legalPages.terms.content,
            },
            privacy: {
              title:
                typeof value.legalPages.privacy?.title === "string" &&
                value.legalPages.privacy.title.trim()
                  ? value.legalPages.privacy.title.trim()
                  : FALLBACK_SITE_SETTINGS.legalPages.privacy.title,
              effectiveDate:
                typeof value.legalPages.privacy?.effectiveDate === "string"
                  ? value.legalPages.privacy.effectiveDate.trim()
                  : FALLBACK_SITE_SETTINGS.legalPages.privacy.effectiveDate,
              content:
                typeof value.legalPages.privacy?.content === "string" &&
                value.legalPages.privacy.content.trim()
                  ? value.legalPages.privacy.content
                  : FALLBACK_SITE_SETTINGS.legalPages.privacy.content,
            },
            intellectual: {
              title:
                typeof value.legalPages.intellectual?.title === "string" &&
                value.legalPages.intellectual.title.trim()
                  ? value.legalPages.intellectual.title.trim()
                  : FALLBACK_SITE_SETTINGS.legalPages.intellectual.title,
              effectiveDate:
                typeof value.legalPages.intellectual?.effectiveDate === "string"
                  ? value.legalPages.intellectual.effectiveDate.trim()
                  : FALLBACK_SITE_SETTINGS.legalPages.intellectual.effectiveDate,
              content:
                typeof value.legalPages.intellectual?.content === "string" &&
                value.legalPages.intellectual.content.trim()
                  ? value.legalPages.intellectual.content
                  : FALLBACK_SITE_SETTINGS.legalPages.intellectual.content,
            },
            cookies: {
              title:
                typeof value.legalPages.cookies?.title === "string" &&
                value.legalPages.cookies.title.trim()
                  ? value.legalPages.cookies.title.trim()
                  : FALLBACK_SITE_SETTINGS.legalPages.cookies.title,
              effectiveDate:
                typeof value.legalPages.cookies?.effectiveDate === "string"
                  ? value.legalPages.cookies.effectiveDate.trim()
                  : FALLBACK_SITE_SETTINGS.legalPages.cookies.effectiveDate,
              content:
                typeof value.legalPages.cookies?.content === "string" &&
                value.legalPages.cookies.content.trim()
                  ? value.legalPages.cookies.content
                  : FALLBACK_SITE_SETTINGS.legalPages.cookies.content,
            },
          }
        : FALLBACK_SITE_SETTINGS.legalPages,
  };
}

export async function getGuestlistSignups(): Promise<GuestlistSignup[]> {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return [];
  }

  const { data: tableData, error: tableError } = await adminClient
    .from("guestlist_signups")
    .select("email, source, status, subscribed_at")
    .order("subscribed_at", { ascending: false });

  if (!tableError && Array.isArray(tableData)) {
    return tableData
      .map((entry) => ({
        email:
          typeof entry.email === "string" ? entry.email.trim().toLowerCase() : "",
        source:
          typeof entry.source === "string" && entry.source.trim()
            ? entry.source.trim()
            : "footer_guestlist",
        status:
          typeof entry.status === "string" && entry.status.trim()
            ? entry.status.trim()
            : "active",
        subscribedAt:
          typeof entry.subscribed_at === "string" && entry.subscribed_at.trim()
            ? entry.subscribed_at.trim()
            : new Date().toISOString(),
      }))
      .filter((entry) => entry.email);
  }

  const { data: fallbackData, error: fallbackError } = await adminClient
    .from("site_settings")
    .select("value")
    .eq("key", "guestlist_signups")
    .maybeSingle();

  if (fallbackError) {
    return [];
  }

  const entries =
    fallbackData?.value &&
    typeof fallbackData.value === "object" &&
    !Array.isArray(fallbackData.value)
      ? normalizeGuestlistEntries((fallbackData.value as { entries?: unknown }).entries)
      : [];

  return sortGuestlistEntries(entries);
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return [];
  }

  const { data: tableData, error: tableError } = await adminClient
    .from("contact_messages")
    .select("first_name, last_name, email, phone, subject, message, source, status, received_at")
    .order("received_at", { ascending: false });

  if (!tableError && Array.isArray(tableData)) {
    return tableData
      .map((entry) => ({
        firstName:
          typeof entry.first_name === "string" ? entry.first_name.trim() : "",
        lastName:
          typeof entry.last_name === "string" ? entry.last_name.trim() : "",
        email:
          typeof entry.email === "string" ? entry.email.trim().toLowerCase() : "",
        phone: typeof entry.phone === "string" ? entry.phone.trim() : "",
        subject:
          typeof entry.subject === "string" ? entry.subject.trim() : "",
        message:
          typeof entry.message === "string" ? entry.message.trim() : "",
        source:
          typeof entry.source === "string" && entry.source.trim()
            ? entry.source.trim()
            : "website_contact",
        status:
          typeof entry.status === "string" && entry.status.trim()
            ? entry.status.trim()
            : "new",
        receivedAt:
          typeof entry.received_at === "string" && entry.received_at.trim()
            ? entry.received_at.trim()
            : new Date().toISOString(),
      }))
      .filter((entry) => entry.email && entry.subject && entry.message);
  }

  const { data: fallbackData, error: fallbackError } = await adminClient
    .from("site_settings")
    .select("value")
    .eq("key", "contact_messages")
    .maybeSingle();

  if (fallbackError) {
    return [];
  }

  const entries =
    fallbackData?.value &&
    typeof fallbackData.value === "object" &&
    !Array.isArray(fallbackData.value)
      ? normalizeContactMessages((fallbackData.value as { entries?: unknown }).entries)
      : [];

  return sortContactMessages(entries);
}

export async function getArticleImageOverrides(): Promise<ArticleImageOverrides> {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return {};
  }

  const { data, error } = await adminClient
    .from("site_settings")
    .select("value")
    .eq("key", "article_image_overrides")
    .maybeSingle();

  if (error || !data?.value || typeof data.value !== "object" || Array.isArray(data.value)) {
    return {};
  }

  const rawEntries = data.value as Record<string, unknown>;

  return Object.fromEntries(
    Object.entries(rawEntries)
      .filter(([, value]) => value && typeof value === "object" && !Array.isArray(value))
      .map(([slug, value]) => {
        const override = value as Partial<ArticleImageOverride>;

        return [
          slug,
          {
            imagePositionX: clampImagePosition(override.imagePositionX),
            imagePositionY: clampImagePosition(override.imagePositionY),
          },
        ];
      })
  );
}

export async function getArticleTags(): Promise<ArticleTagMap> {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return {};
  }

  const { data, error } = await adminClient
    .from("site_settings")
    .select("value")
    .eq("key", "article_tags")
    .maybeSingle();

  if (error || !data?.value || typeof data.value !== "object" || Array.isArray(data.value)) {
    return {};
  }

  const rawEntries = data.value as Record<string, unknown>;

  return Object.fromEntries(
    Object.entries(rawEntries)
      .map(([slug, value]) => [slug, normalizeArticleTags(value)])
      .filter(([, tags]) => tags.length > 0)
  );
}

export async function getUpcomingSettings(): Promise<UpcomingSettings> {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return fallbackUpcomingSettings;
  }

  const { data, error } = await adminClient
    .from("site_settings")
    .select("value")
    .eq("key", "upcoming_settings")
    .maybeSingle();

  if (error || !data?.value || typeof data.value !== "object" || Array.isArray(data.value)) {
    return fallbackUpcomingSettings;
  }

  const value = data.value as Partial<UpcomingSettings>;

  return {
    cinema: Array.isArray(value.cinema)
      ? value.cinema
          .map((item, index) =>
            sanitizeUpcomingItem(
              item,
              fallbackUpcomingSettings.cinema[index] ??
                fallbackUpcomingSettings.cinema[0],
              index,
              "cinema"
            )
          )
      : fallbackUpcomingSettings.cinema,
    entertainment: Array.isArray(value.entertainment)
      ? value.entertainment
          .map((item, index) =>
            sanitizeUpcomingItem(
              item,
              fallbackUpcomingSettings.entertainment[index] ??
                fallbackUpcomingSettings.entertainment[0],
              index,
              "entertainment"
            )
          )
      : fallbackUpcomingSettings.entertainment,
  };
}

function sanitizePartnerCampaign(
  item: unknown,
  fallback: PartnerCampaign,
  index: number
): PartnerCampaign {
  if (!item || typeof item !== "object") {
    return fallback;
  }

  const value = item as Partial<PartnerCampaign>;

  return {
    id:
      typeof value.id === "string" && value.id.trim()
        ? value.id.trim()
        : `campaign-${index + 1}`,
    name:
      typeof value.name === "string" && value.name.trim()
        ? value.name.trim()
        : fallback.name,
    brand:
      typeof value.brand === "string" && value.brand.trim()
        ? value.brand.trim()
        : fallback.brand,
    status:
      value.status === "Live" || value.status === "Review" || value.status === "Scheduled"
        ? value.status
        : fallback.status,
    startDate:
      typeof value.startDate === "string" && value.startDate.trim()
        ? value.startDate.trim()
        : fallback.startDate,
    endDate:
      typeof value.endDate === "string" && value.endDate.trim()
        ? value.endDate.trim()
        : fallback.endDate,
    progress: clampImagePosition(value.progress, fallback.progress),
    budget:
      typeof value.budget === "string" && value.budget.trim()
        ? value.budget.trim()
        : fallback.budget,
    lead:
      typeof value.lead === "string" && value.lead.trim()
        ? value.lead.trim()
        : fallback.lead,
    objective:
      typeof value.objective === "string" && value.objective.trim()
        ? value.objective.trim()
        : fallback.objective,
  };
}

function sanitizePartnerApproval(
  item: unknown,
  fallback: PartnerApproval,
  index: number
): PartnerApproval {
  if (!item || typeof item !== "object") {
    return fallback;
  }

  const value = item as Partial<PartnerApproval>;

  return {
    id:
      typeof value.id === "string" && value.id.trim()
        ? value.id.trim()
        : `approval-${index + 1}`,
    title:
      typeof value.title === "string" && value.title.trim()
        ? value.title.trim()
        : fallback.title,
    type:
      typeof value.type === "string" && value.type.trim()
        ? value.type.trim()
        : fallback.type,
    dueDate:
      typeof value.dueDate === "string" && value.dueDate.trim()
        ? value.dueDate.trim()
        : fallback.dueDate,
    status:
      value.status === "Waiting" ||
      value.status === "Approved" ||
      value.status === "Needs changes"
        ? value.status
        : fallback.status,
    assignee:
      typeof value.assignee === "string" && value.assignee.trim()
        ? value.assignee.trim()
        : fallback.assignee,
  };
}

function sanitizePartnerFile(
  item: unknown,
  fallback: PartnerFile,
  index: number
): PartnerFile {
  if (!item || typeof item !== "object") {
    return fallback;
  }

  const value = item as Partial<PartnerFile>;

  return {
    id:
      typeof value.id === "string" && value.id.trim()
        ? value.id.trim()
        : `file-${index + 1}`,
    name:
      typeof value.name === "string" && value.name.trim()
        ? value.name.trim()
        : fallback.name,
    category:
      typeof value.category === "string" && value.category.trim()
        ? value.category.trim()
        : fallback.category,
    updatedAt:
      typeof value.updatedAt === "string" && value.updatedAt.trim()
        ? value.updatedAt.trim()
        : fallback.updatedAt,
    format:
      typeof value.format === "string" && value.format.trim()
        ? value.format.trim()
        : fallback.format,
    size:
      typeof value.size === "string" && value.size.trim()
        ? value.size.trim()
        : fallback.size,
  };
}

function sanitizePartnerReport(
  item: unknown,
  fallback: PartnerReport,
  index: number,
  prefix: string
): PartnerReport {
  if (!item || typeof item !== "object") {
    return fallback;
  }

  const value = item as Partial<PartnerReport>;

  return {
    id:
      typeof value.id === "string" && value.id.trim()
        ? value.id.trim()
        : `${prefix}-${index + 1}`,
    title:
      typeof value.title === "string" && value.title.trim()
        ? value.title.trim()
        : fallback.title,
    period:
      typeof value.period === "string" && value.period.trim()
        ? value.period.trim()
        : fallback.period,
    summary:
      typeof value.summary === "string" && value.summary.trim()
        ? value.summary.trim()
        : fallback.summary,
    metric:
      typeof value.metric === "string" && value.metric.trim()
        ? value.metric.trim()
        : fallback.metric,
  };
}

function sanitizePartnerMessage(
  item: unknown,
  fallback: PartnerMessage,
  index: number
): PartnerMessage {
  if (!item || typeof item !== "object") {
    return fallback;
  }

  const value = item as Partial<PartnerMessage>;

  return {
    id:
      typeof value.id === "string" && value.id.trim()
        ? value.id.trim()
        : `message-${index + 1}`,
    author:
      typeof value.author === "string" && value.author.trim()
        ? value.author.trim()
        : fallback.author,
    role:
      typeof value.role === "string" && value.role.trim()
        ? value.role.trim()
        : fallback.role,
    date:
      typeof value.date === "string" && value.date.trim()
        ? value.date.trim()
        : fallback.date,
    message:
      typeof value.message === "string" && value.message.trim()
        ? value.message.trim()
        : fallback.message,
  };
}

function sanitizePartnerLog(
  item: unknown,
  fallback: PartnerLogEntry,
  index: number
): PartnerLogEntry {
  if (!item || typeof item !== "object") {
    return fallback;
  }

  const value = item as Partial<PartnerLogEntry>;

  return {
    id:
      typeof value.id === "string" && value.id.trim()
        ? value.id.trim()
        : `log-${index + 1}`,
    date:
      typeof value.date === "string" && value.date.trim()
        ? value.date.trim()
        : fallback.date,
    item:
      typeof value.item === "string" && value.item.trim()
        ? value.item.trim()
        : fallback.item,
    note:
      typeof value.note === "string" && value.note.trim()
        ? value.note.trim()
        : fallback.note,
  };
}

function sanitizeBackstageClientAccount(
  item: unknown,
  index: number
): BackstageClientAccount | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const value = item as Partial<BackstageClientAccount>;
  const slug =
    typeof value.slug === "string" && value.slug.trim() ? value.slug.trim() : "";
  const companyName =
    typeof value.companyName === "string" && value.companyName.trim()
      ? value.companyName.trim()
      : "";
  const logoUrl =
    typeof value.logoUrl === "string" && value.logoUrl.trim()
      ? value.logoUrl.trim()
      : "";
  const contactName =
    typeof value.contactName === "string" && value.contactName.trim()
      ? value.contactName.trim()
      : "";
  const email =
    typeof value.email === "string" && value.email.trim() ? value.email.trim() : "";
  const authUserId =
    typeof value.authUserId === "string" && value.authUserId.trim()
      ? value.authUserId.trim()
      : "";

  if (!slug || !companyName || !contactName || !email || !authUserId) {
    return null;
  }

  return {
    id:
      typeof value.id === "string" && value.id.trim()
        ? value.id.trim()
        : `client-${index + 1}`,
    slug,
    companyName,
    logoUrl,
    contactName,
    email,
    authUserId,
    createdAt:
      typeof value.createdAt === "string" && value.createdAt.trim()
        ? value.createdAt.trim()
        : new Date().toISOString(),
    updatedAt:
      typeof value.updatedAt === "string" && value.updatedAt.trim()
        ? value.updatedAt.trim()
        : new Date().toISOString(),
    portalSettings:
      value.portalSettings && typeof value.portalSettings === "object"
        ? {
            gateway: {
              eyebrow:
                typeof value.portalSettings.gateway?.eyebrow === "string" &&
                value.portalSettings.gateway.eyebrow.trim()
                  ? value.portalSettings.gateway.eyebrow.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.gateway.eyebrow,
              title:
                typeof value.portalSettings.gateway?.title === "string" &&
                value.portalSettings.gateway.title.trim()
                  ? value.portalSettings.gateway.title.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.gateway.title,
              subtitle:
                typeof value.portalSettings.gateway?.subtitle === "string" &&
                value.portalSettings.gateway.subtitle.trim()
                  ? value.portalSettings.gateway.subtitle.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.gateway.subtitle,
              existingEyebrow:
                typeof value.portalSettings.gateway?.existingEyebrow === "string" &&
                value.portalSettings.gateway.existingEyebrow.trim()
                  ? value.portalSettings.gateway.existingEyebrow.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.gateway.existingEyebrow,
              existingTitle:
                typeof value.portalSettings.gateway?.existingTitle === "string" &&
                value.portalSettings.gateway.existingTitle.trim()
                  ? value.portalSettings.gateway.existingTitle.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.gateway.existingTitle,
              existingDescription:
                typeof value.portalSettings.gateway?.existingDescription === "string" &&
                value.portalSettings.gateway.existingDescription.trim()
                  ? value.portalSettings.gateway.existingDescription.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.gateway.existingDescription,
              existingCtaLabel:
                typeof value.portalSettings.gateway?.existingCtaLabel === "string" &&
                value.portalSettings.gateway.existingCtaLabel.trim()
                  ? value.portalSettings.gateway.existingCtaLabel.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.gateway.existingCtaLabel,
              joinEyebrow:
                typeof value.portalSettings.gateway?.joinEyebrow === "string" &&
                value.portalSettings.gateway.joinEyebrow.trim()
                  ? value.portalSettings.gateway.joinEyebrow.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.gateway.joinEyebrow,
              joinTitle:
                typeof value.portalSettings.gateway?.joinTitle === "string" &&
                value.portalSettings.gateway.joinTitle.trim()
                  ? value.portalSettings.gateway.joinTitle.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.gateway.joinTitle,
              joinDescription:
                typeof value.portalSettings.gateway?.joinDescription === "string" &&
                value.portalSettings.gateway.joinDescription.trim()
                  ? value.portalSettings.gateway.joinDescription.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.gateway.joinDescription,
              joinCtaLabel:
                typeof value.portalSettings.gateway?.joinCtaLabel === "string" &&
                value.portalSettings.gateway.joinCtaLabel.trim()
                  ? value.portalSettings.gateway.joinCtaLabel.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.gateway.joinCtaLabel,
            },
            login: {
              eyebrow:
                typeof value.portalSettings.login?.eyebrow === "string" &&
                value.portalSettings.login.eyebrow.trim()
                  ? value.portalSettings.login.eyebrow.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.login.eyebrow,
              title:
                typeof value.portalSettings.login?.title === "string" &&
                value.portalSettings.login.title.trim()
                  ? value.portalSettings.login.title.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.login.title,
              subtitle:
                typeof value.portalSettings.login?.subtitle === "string" &&
                value.portalSettings.login.subtitle.trim()
                  ? value.portalSettings.login.subtitle.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.login.subtitle,
              submitLabel:
                typeof value.portalSettings.login?.submitLabel === "string" &&
                value.portalSettings.login.submitLabel.trim()
                  ? value.portalSettings.login.submitLabel.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.login.submitLabel,
              backLabel:
                typeof value.portalSettings.login?.backLabel === "string" &&
                value.portalSettings.login.backLabel.trim()
                  ? value.portalSettings.login.backLabel.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.login.backLabel,
              contactLabel:
                typeof value.portalSettings.login?.contactLabel === "string" &&
                value.portalSettings.login.contactLabel.trim()
                  ? value.portalSettings.login.contactLabel.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.login.contactLabel,
            },
            shell: {
              eyebrow:
                typeof value.portalSettings.shell?.eyebrow === "string" &&
                value.portalSettings.shell.eyebrow.trim()
                  ? value.portalSettings.shell.eyebrow.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.shell.eyebrow,
              title:
                typeof value.portalSettings.shell?.title === "string" &&
                value.portalSettings.shell.title.trim()
                  ? value.portalSettings.shell.title.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.shell.title,
              description:
                typeof value.portalSettings.shell?.description === "string" &&
                value.portalSettings.shell.description.trim()
                  ? value.portalSettings.shell.description.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.shell.description,
              contactEmail:
                typeof value.portalSettings.shell?.contactEmail === "string" &&
                value.portalSettings.shell.contactEmail.trim()
                  ? value.portalSettings.shell.contactEmail.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.shell.contactEmail,
              contactDescription:
                typeof value.portalSettings.shell?.contactDescription === "string" &&
                value.portalSettings.shell.contactDescription.trim()
                  ? value.portalSettings.shell.contactDescription.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.shell.contactDescription,
            },
            overview: {
              title:
                typeof value.portalSettings.overview?.title === "string" &&
                value.portalSettings.overview.title.trim()
                  ? value.portalSettings.overview.title.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.overview.title,
              subtitle:
                typeof value.portalSettings.overview?.subtitle === "string" &&
                value.portalSettings.overview.subtitle.trim()
                  ? value.portalSettings.overview.subtitle.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.overview.subtitle,
            },
            campaignsPage: {
              title:
                typeof value.portalSettings.campaignsPage?.title === "string" &&
                value.portalSettings.campaignsPage.title.trim()
                  ? value.portalSettings.campaignsPage.title.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.campaignsPage.title,
              subtitle:
                typeof value.portalSettings.campaignsPage?.subtitle === "string" &&
                value.portalSettings.campaignsPage.subtitle.trim()
                  ? value.portalSettings.campaignsPage.subtitle.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.campaignsPage.subtitle,
            },
            approvalsPage: {
              title:
                typeof value.portalSettings.approvalsPage?.title === "string" &&
                value.portalSettings.approvalsPage.title.trim()
                  ? value.portalSettings.approvalsPage.title.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.approvalsPage.title,
              subtitle:
                typeof value.portalSettings.approvalsPage?.subtitle === "string" &&
                value.portalSettings.approvalsPage.subtitle.trim()
                  ? value.portalSettings.approvalsPage.subtitle.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.approvalsPage.subtitle,
            },
            filesPage: {
              title:
                typeof value.portalSettings.filesPage?.title === "string" &&
                value.portalSettings.filesPage.title.trim()
                  ? value.portalSettings.filesPage.title.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.filesPage.title,
              subtitle:
                typeof value.portalSettings.filesPage?.subtitle === "string" &&
                value.portalSettings.filesPage.subtitle.trim()
                  ? value.portalSettings.filesPage.subtitle.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.filesPage.subtitle,
            },
            reportsPage: {
              title:
                typeof value.portalSettings.reportsPage?.title === "string" &&
                value.portalSettings.reportsPage.title.trim()
                  ? value.portalSettings.reportsPage.title.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.reportsPage.title,
              subtitle:
                typeof value.portalSettings.reportsPage?.subtitle === "string" &&
                value.portalSettings.reportsPage.subtitle.trim()
                  ? value.portalSettings.reportsPage.subtitle.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.reportsPage.subtitle,
            },
            messagesPage: {
              title:
                typeof value.portalSettings.messagesPage?.title === "string" &&
                value.portalSettings.messagesPage.title.trim()
                  ? value.portalSettings.messagesPage.title.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.messagesPage.title,
              subtitle:
                typeof value.portalSettings.messagesPage?.subtitle === "string" &&
                value.portalSettings.messagesPage.subtitle.trim()
                  ? value.portalSettings.messagesPage.subtitle.trim()
                  : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.messagesPage.subtitle,
            },
            campaigns: Array.isArray(value.portalSettings.campaigns)
              ? value.portalSettings.campaigns
                  .map((campaign, campaignIndex) =>
                    sanitizePartnerCampaign(
                      campaign,
                      FALLBACK_BACKSTAGE_PORTAL_SETTINGS.campaigns[
                        campaignIndex % FALLBACK_BACKSTAGE_PORTAL_SETTINGS.campaigns.length
                      ],
                      campaignIndex
                    )
                  )
                  .filter(Boolean)
              : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.campaigns,
            approvals: Array.isArray(value.portalSettings.approvals)
              ? value.portalSettings.approvals
                  .map((approval, approvalIndex) =>
                    sanitizePartnerApproval(
                      approval,
                      FALLBACK_BACKSTAGE_PORTAL_SETTINGS.approvals[
                        approvalIndex % FALLBACK_BACKSTAGE_PORTAL_SETTINGS.approvals.length
                      ],
                      approvalIndex
                    )
                  )
                  .filter(Boolean)
              : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.approvals,
            files: Array.isArray(value.portalSettings.files)
              ? value.portalSettings.files
                  .map((file, fileIndex) =>
                    sanitizePartnerFile(
                      file,
                      FALLBACK_BACKSTAGE_PORTAL_SETTINGS.files[
                        fileIndex % FALLBACK_BACKSTAGE_PORTAL_SETTINGS.files.length
                      ],
                      fileIndex
                    )
                  )
                  .filter(Boolean)
              : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.files,
            reports: Array.isArray(value.portalSettings.reports)
              ? value.portalSettings.reports
                  .map((report, reportIndex) =>
                    sanitizePartnerReport(
                      report,
                      FALLBACK_BACKSTAGE_PORTAL_SETTINGS.reports[
                        reportIndex % FALLBACK_BACKSTAGE_PORTAL_SETTINGS.reports.length
                      ],
                      reportIndex,
                      "report"
                    )
                  )
                  .filter(Boolean)
              : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.reports,
            invoices: Array.isArray(value.portalSettings.invoices)
              ? value.portalSettings.invoices
                  .map((invoice, invoiceIndex) =>
                    sanitizePartnerReport(
                      invoice,
                      FALLBACK_BACKSTAGE_PORTAL_SETTINGS.invoices[
                        invoiceIndex % FALLBACK_BACKSTAGE_PORTAL_SETTINGS.invoices.length
                      ],
                      invoiceIndex,
                      "invoice"
                    )
                  )
                  .filter(Boolean)
              : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.invoices,
            messages: Array.isArray(value.portalSettings.messages)
              ? value.portalSettings.messages
                  .map((message, messageIndex) =>
                    sanitizePartnerMessage(
                      message,
                      FALLBACK_BACKSTAGE_PORTAL_SETTINGS.messages[
                        messageIndex % FALLBACK_BACKSTAGE_PORTAL_SETTINGS.messages.length
                      ],
                      messageIndex
                    )
                  )
                  .filter(Boolean)
              : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.messages,
            activityLog: Array.isArray(value.portalSettings.activityLog)
              ? value.portalSettings.activityLog
                  .map((entry, entryIndex) =>
                    sanitizePartnerLog(
                      entry,
                      FALLBACK_BACKSTAGE_PORTAL_SETTINGS.activityLog[
                        entryIndex % FALLBACK_BACKSTAGE_PORTAL_SETTINGS.activityLog.length
                      ],
                      entryIndex
                    )
                  )
                  .filter(Boolean)
              : FALLBACK_BACKSTAGE_PORTAL_SETTINGS.activityLog,
          }
        : FALLBACK_BACKSTAGE_PORTAL_SETTINGS,
  };
}

export async function getBackstageClients(): Promise<BackstageClientAccount[]> {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return FALLBACK_BACKSTAGE_CLIENTS;
  }

  const { data, error } = await adminClient
    .from("site_settings")
    .select("value")
    .eq("key", "backstage_clients")
    .maybeSingle();

  if (error || !data?.value || !Array.isArray(data.value)) {
    return FALLBACK_BACKSTAGE_CLIENTS;
  }

  return data.value
    .map((item, index) => sanitizeBackstageClientAccount(item, index))
    .filter((item): item is BackstageClientAccount => Boolean(item));
}

export async function getBackstageClientBySlug(slug: string) {
  const clients = await getBackstageClients();
  return clients.find((client) => client.slug === slug) ?? null;
}

export async function getBackstageClientByUserId(userId: string) {
  const clients = await getBackstageClients();
  return clients.find((client) => client.authUserId === userId) ?? null;
}

export async function getBackstagePortalSettings(
  clientSlug?: string
): Promise<BackstagePortalSettings> {
  if (clientSlug) {
    const client = await getBackstageClientBySlug(clientSlug);
    if (client?.portalSettings) {
      return client.portalSettings;
    }
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return FALLBACK_BACKSTAGE_PORTAL_SETTINGS;
  }

  const { data, error } = await adminClient
    .from("site_settings")
    .select("value")
    .eq("key", "backstage_portal_settings")
    .maybeSingle();

  if (error || !data?.value || typeof data.value !== "object" || Array.isArray(data.value)) {
    return FALLBACK_BACKSTAGE_PORTAL_SETTINGS;
  }

  const value = data.value as Partial<BackstagePortalSettings>;
  const fallback = FALLBACK_BACKSTAGE_PORTAL_SETTINGS;

  return {
    gateway: {
      eyebrow:
        typeof value.gateway?.eyebrow === "string" && value.gateway.eyebrow.trim()
          ? value.gateway.eyebrow.trim()
          : fallback.gateway.eyebrow,
      title:
        typeof value.gateway?.title === "string" && value.gateway.title.trim()
          ? value.gateway.title.trim()
          : fallback.gateway.title,
      subtitle:
        typeof value.gateway?.subtitle === "string" && value.gateway.subtitle.trim()
          ? value.gateway.subtitle.trim()
          : fallback.gateway.subtitle,
      existingEyebrow:
        typeof value.gateway?.existingEyebrow === "string" &&
        value.gateway.existingEyebrow.trim()
          ? value.gateway.existingEyebrow.trim()
          : fallback.gateway.existingEyebrow,
      existingTitle:
        typeof value.gateway?.existingTitle === "string" &&
        value.gateway.existingTitle.trim()
          ? value.gateway.existingTitle.trim()
          : fallback.gateway.existingTitle,
      existingDescription:
        typeof value.gateway?.existingDescription === "string" &&
        value.gateway.existingDescription.trim()
          ? value.gateway.existingDescription.trim()
          : fallback.gateway.existingDescription,
      existingCtaLabel:
        typeof value.gateway?.existingCtaLabel === "string" &&
        value.gateway.existingCtaLabel.trim()
          ? value.gateway.existingCtaLabel.trim()
          : fallback.gateway.existingCtaLabel,
      joinEyebrow:
        typeof value.gateway?.joinEyebrow === "string" && value.gateway.joinEyebrow.trim()
          ? value.gateway.joinEyebrow.trim()
          : fallback.gateway.joinEyebrow,
      joinTitle:
        typeof value.gateway?.joinTitle === "string" && value.gateway.joinTitle.trim()
          ? value.gateway.joinTitle.trim()
          : fallback.gateway.joinTitle,
      joinDescription:
        typeof value.gateway?.joinDescription === "string" &&
        value.gateway.joinDescription.trim()
          ? value.gateway.joinDescription.trim()
          : fallback.gateway.joinDescription,
      joinCtaLabel:
        typeof value.gateway?.joinCtaLabel === "string" &&
        value.gateway.joinCtaLabel.trim()
          ? value.gateway.joinCtaLabel.trim()
          : fallback.gateway.joinCtaLabel,
    },
    login: {
      eyebrow:
        typeof value.login?.eyebrow === "string" && value.login.eyebrow.trim()
          ? value.login.eyebrow.trim()
          : fallback.login.eyebrow,
      title:
        typeof value.login?.title === "string" && value.login.title.trim()
          ? value.login.title.trim()
          : fallback.login.title,
      subtitle:
        typeof value.login?.subtitle === "string" && value.login.subtitle.trim()
          ? value.login.subtitle.trim()
          : fallback.login.subtitle,
      submitLabel:
        typeof value.login?.submitLabel === "string" && value.login.submitLabel.trim()
          ? value.login.submitLabel.trim()
          : fallback.login.submitLabel,
      backLabel:
        typeof value.login?.backLabel === "string" && value.login.backLabel.trim()
          ? value.login.backLabel.trim()
          : fallback.login.backLabel,
      contactLabel:
        typeof value.login?.contactLabel === "string" && value.login.contactLabel.trim()
          ? value.login.contactLabel.trim()
          : fallback.login.contactLabel,
    },
    shell: {
      eyebrow:
        typeof value.shell?.eyebrow === "string" && value.shell.eyebrow.trim()
          ? value.shell.eyebrow.trim()
          : fallback.shell.eyebrow,
      title:
        typeof value.shell?.title === "string" && value.shell.title.trim()
          ? value.shell.title.trim()
          : fallback.shell.title,
      description:
        typeof value.shell?.description === "string" && value.shell.description.trim()
          ? value.shell.description.trim()
          : fallback.shell.description,
      contactEmail:
        typeof value.shell?.contactEmail === "string" && value.shell.contactEmail.trim()
          ? value.shell.contactEmail.trim()
          : fallback.shell.contactEmail,
      contactDescription:
        typeof value.shell?.contactDescription === "string" &&
        value.shell.contactDescription.trim()
          ? value.shell.contactDescription.trim()
          : fallback.shell.contactDescription,
    },
    overview: {
      title:
        typeof value.overview?.title === "string" && value.overview.title.trim()
          ? value.overview.title.trim()
          : fallback.overview.title,
      subtitle:
        typeof value.overview?.subtitle === "string" && value.overview.subtitle.trim()
          ? value.overview.subtitle.trim()
          : fallback.overview.subtitle,
    },
    campaignsPage: {
      title:
        typeof value.campaignsPage?.title === "string" && value.campaignsPage.title.trim()
          ? value.campaignsPage.title.trim()
          : fallback.campaignsPage.title,
      subtitle:
        typeof value.campaignsPage?.subtitle === "string" &&
        value.campaignsPage.subtitle.trim()
          ? value.campaignsPage.subtitle.trim()
          : fallback.campaignsPage.subtitle,
    },
    approvalsPage: {
      title:
        typeof value.approvalsPage?.title === "string" &&
        value.approvalsPage.title.trim()
          ? value.approvalsPage.title.trim()
          : fallback.approvalsPage.title,
      subtitle:
        typeof value.approvalsPage?.subtitle === "string" &&
        value.approvalsPage.subtitle.trim()
          ? value.approvalsPage.subtitle.trim()
          : fallback.approvalsPage.subtitle,
    },
    filesPage: {
      title:
        typeof value.filesPage?.title === "string" && value.filesPage.title.trim()
          ? value.filesPage.title.trim()
          : fallback.filesPage.title,
      subtitle:
        typeof value.filesPage?.subtitle === "string" && value.filesPage.subtitle.trim()
          ? value.filesPage.subtitle.trim()
          : fallback.filesPage.subtitle,
    },
    reportsPage: {
      title:
        typeof value.reportsPage?.title === "string" && value.reportsPage.title.trim()
          ? value.reportsPage.title.trim()
          : fallback.reportsPage.title,
      subtitle:
        typeof value.reportsPage?.subtitle === "string" &&
        value.reportsPage.subtitle.trim()
          ? value.reportsPage.subtitle.trim()
          : fallback.reportsPage.subtitle,
    },
    messagesPage: {
      title:
        typeof value.messagesPage?.title === "string" && value.messagesPage.title.trim()
          ? value.messagesPage.title.trim()
          : fallback.messagesPage.title,
      subtitle:
        typeof value.messagesPage?.subtitle === "string" &&
        value.messagesPage.subtitle.trim()
          ? value.messagesPage.subtitle.trim()
          : fallback.messagesPage.subtitle,
    },
    campaigns: Array.isArray(value.campaigns)
      ? value.campaigns.map((item, index) =>
          sanitizePartnerCampaign(
            item,
            fallback.campaigns[index] ?? fallback.campaigns[0],
            index
          )
        )
      : fallback.campaigns,
    approvals: Array.isArray(value.approvals)
      ? value.approvals.map((item, index) =>
          sanitizePartnerApproval(
            item,
            fallback.approvals[index] ?? fallback.approvals[0],
            index
          )
        )
      : fallback.approvals,
    files: Array.isArray(value.files)
      ? value.files.map((item, index) =>
          sanitizePartnerFile(item, fallback.files[index] ?? fallback.files[0], index)
        )
      : fallback.files,
    reports: Array.isArray(value.reports)
      ? value.reports.map((item, index) =>
          sanitizePartnerReport(
            item,
            fallback.reports[index] ?? fallback.reports[0],
            index,
            "report"
          )
        )
      : fallback.reports,
    invoices: Array.isArray(value.invoices)
      ? value.invoices.map((item, index) =>
          sanitizePartnerReport(
            item,
            fallback.invoices[index] ?? fallback.invoices[0],
            index,
            "invoice"
          )
        )
      : fallback.invoices,
    messages: Array.isArray(value.messages)
      ? value.messages.map((item, index) =>
          sanitizePartnerMessage(
            item,
            fallback.messages[index] ?? fallback.messages[0],
            index
          )
        )
      : fallback.messages,
    activityLog: Array.isArray(value.activityLog)
      ? value.activityLog.map((item, index) =>
          sanitizePartnerLog(
            item,
            fallback.activityLog[index] ?? fallback.activityLog[0],
            index
          )
        )
      : fallback.activityLog,
  };
}
