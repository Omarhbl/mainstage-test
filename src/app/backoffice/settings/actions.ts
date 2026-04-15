"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import {
  createSupabaseAdminClient,
  getSiteSettings,
} from "@/lib/supabase/server";

function buildSettingsRedirect(
  message: string,
  type: "success" | "error",
  redirectTarget?: string
) {
  const params = new URLSearchParams({
    notice: message,
    type,
  });

  const targetPath =
    redirectTarget && redirectTarget.startsWith("settings:")
      ? `/backoffice/settings/${redirectTarget.replace("settings:", "")}`
      : "/backoffice/settings";

  redirect(`${targetPath}?${params.toString()}`);
}

export async function updateSiteSettingsAction(formData: FormData) {
  await requireBackofficeAccess(["admin"]);

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildSettingsRedirect("Missing service role key in .env.local.", "error");
  }

  const currentSettings = await getSiteSettings();
  const section = String(formData.get("section") ?? "").trim();
  const redirectTarget = String(formData.get("redirect_target") ?? "").trim();

  const nextSettings = {
    ...currentSettings,
    contactEmail:
      section === "contact"
        ? String(formData.get("contact_email") ?? "").trim()
        : currentSettings.contactEmail,
    instagramUrl:
      section === "social"
        ? String(formData.get("instagram_url") ?? "").trim()
        : currentSettings.instagramUrl,
    youtubeUrl:
      section === "social"
        ? String(formData.get("youtube_url") ?? "").trim()
        : currentSettings.youtubeUrl,
    tiktokUrl:
      section === "social"
        ? String(formData.get("tiktok_url") ?? "").trim()
        : currentSettings.tiktokUrl,
    aboutPage:
      section === "about"
        ? {
            title: String(formData.get("about_title") ?? "").trim(),
            introContent: String(formData.get("about_intro_content") ?? "").trim(),
            signature: String(formData.get("about_signature") ?? "").trim(),
            coverageTitle: String(formData.get("about_coverage_title") ?? "").trim(),
            coverageSubtitle: String(formData.get("about_coverage_subtitle") ?? "").trim(),
            coverageItems: Array.from({ length: 6 }, (_, index) => ({
              title: String(formData.get(`about_coverage_item_title_${index + 1}`) ?? "").trim(),
              description: String(
                formData.get(`about_coverage_item_description_${index + 1}`) ?? ""
              ).trim(),
              image: String(formData.get(`about_coverage_item_image_${index + 1}`) ?? "").trim(),
            })),
          }
        : currentSettings.aboutPage,
    footerTagline:
      section === "footer"
        ? String(formData.get("footer_tagline") ?? "").trim()
        : currentSettings.footerTagline,
    copyrightText:
      section === "footer"
        ? String(formData.get("copyright_text") ?? "").trim()
        : currentSettings.copyrightText,
    legalLinks:
      section === "legal"
        ? Array.from({ length: 4 }, (_, index) => ({
            label: String(formData.get(`legal_label_${index + 1}`) ?? "").trim(),
            href: String(formData.get(`legal_href_${index + 1}`) ?? "").trim(),
          }))
        : currentSettings.legalLinks,
    legalPages:
      section === "legal_pages"
        ? {
            terms: {
              title: String(formData.get("terms_title") ?? "").trim(),
              effectiveDate: String(formData.get("terms_effective_date") ?? "").trim(),
              content: String(formData.get("terms_content") ?? "").trim(),
            },
            privacy: {
              title: String(formData.get("privacy_title") ?? "").trim(),
              effectiveDate: String(formData.get("privacy_effective_date") ?? "").trim(),
              content: String(formData.get("privacy_content") ?? "").trim(),
            },
            intellectual: {
              title: String(formData.get("intellectual_title") ?? "").trim(),
              effectiveDate: String(formData.get("intellectual_effective_date") ?? "").trim(),
              content: String(formData.get("intellectual_content") ?? "").trim(),
            },
            cookies: {
              title: String(formData.get("cookies_title") ?? "").trim(),
              effectiveDate: String(formData.get("cookies_effective_date") ?? "").trim(),
              content: String(formData.get("cookies_content") ?? "").trim(),
            },
          }
        : currentSettings.legalPages,
  };

  if (section === "contact" && !nextSettings.contactEmail) {
    buildSettingsRedirect(
      "Please add the main contact email before saving.",
      "error",
      redirectTarget
    );
  }

  if (
    section === "about" &&
    (!nextSettings.aboutPage.title ||
      !nextSettings.aboutPage.introContent ||
      !nextSettings.aboutPage.signature ||
      !nextSettings.aboutPage.coverageTitle ||
      !nextSettings.aboutPage.coverageSubtitle ||
      nextSettings.aboutPage.coverageItems.some(
        (item) => !item.title || !item.description || !item.image
      ))
  ) {
    buildSettingsRedirect(
      "Please complete all About Us fields, including the coverage cards, before saving.",
      "error",
      redirectTarget
    );
  }

  if (
    section === "footer" &&
    (!nextSettings.footerTagline || !nextSettings.copyrightText)
  ) {
    buildSettingsRedirect(
      "Please complete the footer details before saving.",
      "error",
      redirectTarget
    );
  }

  if (
    section === "legal" &&
    nextSettings.legalLinks.some((item) => !item.label || !item.href)
  ) {
    buildSettingsRedirect(
      "Please complete all legal footer links before saving.",
      "error",
      redirectTarget
    );
  }

  if (
    section === "legal_pages" &&
    (!nextSettings.legalPages.terms.title ||
      !nextSettings.legalPages.terms.content ||
      !nextSettings.legalPages.privacy.title ||
      !nextSettings.legalPages.privacy.content ||
      !nextSettings.legalPages.intellectual.title ||
      !nextSettings.legalPages.intellectual.content ||
      !nextSettings.legalPages.cookies.title ||
      !nextSettings.legalPages.cookies.content)
  ) {
    buildSettingsRedirect(
      "Please complete the title and content for each legal page before saving.",
      "error",
      redirectTarget
    );
  }

  const { data: existingSetting, error: existingError } = await adminClient!
    .from("site_settings")
    .select("key")
    .eq("key", "site_config")
    .maybeSingle();

  if (existingError) {
    buildSettingsRedirect(
      existingError.message || "We couldn’t load the site settings before saving.",
      "error",
      redirectTarget
    );
  }

  const payload = {
    key: "site_config",
    value: nextSettings,
    updated_at: new Date().toISOString(),
  };

  const { error } = existingSetting
    ? await adminClient!
        .from("site_settings")
        .update({
          value: payload.value,
          updated_at: payload.updated_at,
        })
        .eq("key", payload.key)
    : await adminClient!.from("site_settings").insert(payload);

  if (error) {
    buildSettingsRedirect(
      error.message || "We couldn’t save the site settings yet.",
      "error",
      redirectTarget
    );
  }

  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/about");
  revalidatePath("/music");
  revalidatePath("/cinema");
  revalidatePath("/people");
  revalidatePath("/sport");
  revalidatePath("/events");
  revalidatePath("/culture");
  revalidatePath("/terms-conditions");
  revalidatePath("/privacy-policy");
  revalidatePath("/intellectual-property");
  revalidatePath("/cookies-privacy");
  revalidatePath("/backoffice/settings");
  revalidatePath("/backoffice/settings/about");
  revalidatePath("/backoffice/settings/contact");
  revalidatePath("/backoffice/settings/social");
  revalidatePath("/backoffice/settings/footer");
  revalidatePath("/backoffice/settings/legal");
  revalidatePath("/backoffice/settings/legal-pages");

  buildSettingsRedirect("Site settings updated successfully.", "success", redirectTarget);
}

export async function updateContactMessageStatusAction(formData: FormData) {
  await requireBackofficeAccess(["admin", "editor"]);

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildSettingsRedirect(
      "Missing service role key in .env.local.",
      "error",
      "settings:contact-inbox"
    );
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const subject = String(formData.get("subject") ?? "").trim();
  const receivedAt = String(formData.get("received_at") ?? "").trim();
  const nextStatus = String(formData.get("status") ?? "").trim().toLowerCase();

  if (!email || !subject || !receivedAt || !["new", "replied", "archived"].includes(nextStatus)) {
    buildSettingsRedirect(
      "We couldn’t update this message status. Please try again.",
      "error",
      "settings:contact-inbox"
    );
  }

  const { error: tableError } = await adminClient!
    .from("contact_messages")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("email", email)
    .eq("subject", subject)
    .eq("received_at", receivedAt);

  if (tableError) {
    const { data: fallbackData, error: fallbackError } = await adminClient!
      .from("site_settings")
      .select("value")
      .eq("key", "contact_messages")
      .maybeSingle();

    if (fallbackError) {
      buildSettingsRedirect(
        fallbackError.message || "We couldn’t load the contact inbox settings.",
        "error",
        "settings:contact-inbox"
      );
    }

    const currentValue =
      fallbackData?.value && typeof fallbackData.value === "object" && !Array.isArray(fallbackData.value)
        ? (fallbackData.value as { entries?: unknown })
        : { entries: [] };

    const currentEntries = Array.isArray(currentValue.entries)
      ? currentValue.entries
      : [];

    const nextEntries = currentEntries.map((entry) => {
      if (!entry || typeof entry !== "object") {
        return entry;
      }

      const record = entry as Record<string, unknown>;
      const recordEmail =
        typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
      const recordSubject =
        typeof record.subject === "string" ? record.subject.trim() : "";
      const recordReceivedAt =
        typeof record.receivedAt === "string" ? record.receivedAt.trim() : "";

      if (
        recordEmail === email &&
        recordSubject === subject &&
        recordReceivedAt === receivedAt
      ) {
        return {
          ...record,
          status: nextStatus,
        };
      }

      return entry;
    });

    const { error: saveFallbackError } = await adminClient!.from("site_settings").upsert(
      {
        key: "contact_messages",
        value: { entries: nextEntries },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (saveFallbackError) {
      buildSettingsRedirect(
        saveFallbackError.message || "We couldn’t update this contact message yet.",
        "error",
        "settings:contact-inbox"
      );
    }
  }

  revalidatePath("/backoffice/settings");
  revalidatePath("/backoffice/settings/contact-inbox");

  buildSettingsRedirect(
    "Contact message status updated.",
    "success",
    "settings:contact-inbox"
  );
}

export async function deleteContactMessageAction(formData: FormData) {
  await requireBackofficeAccess(["admin", "editor"]);

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildSettingsRedirect(
      "Missing service role key in .env.local.",
      "error",
      "settings:contact-inbox"
    );
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const subject = String(formData.get("subject") ?? "").trim();
  const receivedAt = String(formData.get("received_at") ?? "").trim();

  if (!email || !subject || !receivedAt) {
    buildSettingsRedirect(
      "We couldn’t delete this message. Please try again.",
      "error",
      "settings:contact-inbox"
    );
  }

  const { error: tableError } = await adminClient!
    .from("contact_messages")
    .delete()
    .eq("email", email)
    .eq("subject", subject)
    .eq("received_at", receivedAt);

  if (tableError) {
    const { data: fallbackData, error: fallbackError } = await adminClient!
      .from("site_settings")
      .select("value")
      .eq("key", "contact_messages")
      .maybeSingle();

    if (fallbackError) {
      buildSettingsRedirect(
        fallbackError.message || "We couldn’t load the contact inbox settings.",
        "error",
        "settings:contact-inbox"
      );
    }

    const currentValue =
      fallbackData?.value && typeof fallbackData.value === "object" && !Array.isArray(fallbackData.value)
        ? (fallbackData.value as { entries?: unknown })
        : { entries: [] };

    const currentEntries = Array.isArray(currentValue.entries)
      ? currentValue.entries
      : [];

    const nextEntries = currentEntries.filter((entry) => {
      if (!entry || typeof entry !== "object") {
        return true;
      }

      const record = entry as Record<string, unknown>;
      const recordEmail =
        typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
      const recordSubject =
        typeof record.subject === "string" ? record.subject.trim() : "";
      const recordReceivedAt =
        typeof record.receivedAt === "string" ? record.receivedAt.trim() : "";

      return !(
        recordEmail === email &&
        recordSubject === subject &&
        recordReceivedAt === receivedAt
      );
    });

    const { error: saveFallbackError } = await adminClient!.from("site_settings").upsert(
      {
        key: "contact_messages",
        value: { entries: nextEntries },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (saveFallbackError) {
      buildSettingsRedirect(
        saveFallbackError.message || "We couldn’t delete this contact message yet.",
        "error",
        "settings:contact-inbox"
      );
    }
  }

  revalidatePath("/backoffice/settings");
  revalidatePath("/backoffice/settings/contact-inbox");

  buildSettingsRedirect(
    "Contact message deleted.",
    "success",
    "settings:contact-inbox"
  );
}

export async function deleteGuestlistSignupAction(formData: FormData) {
  await requireBackofficeAccess(["admin", "editor"]);

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildSettingsRedirect(
      "Missing service role key in .env.local.",
      "error",
      "settings:guestlist"
    );
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const subscribedAt = String(formData.get("subscribed_at") ?? "").trim();

  if (!email || !subscribedAt) {
    buildSettingsRedirect(
      "We couldn’t delete this guestlist email. Please try again.",
      "error",
      "settings:guestlist"
    );
  }

  const { error: tableError } = await adminClient!
    .from("guestlist_signups")
    .delete()
    .eq("email", email)
    .eq("subscribed_at", subscribedAt);

  if (tableError) {
    const { data: fallbackData, error: fallbackError } = await adminClient!
      .from("site_settings")
      .select("value")
      .eq("key", "guestlist_signups")
      .maybeSingle();

    if (fallbackError) {
      buildSettingsRedirect(
        fallbackError.message || "We couldn’t load the guestlist yet.",
        "error",
        "settings:guestlist"
      );
    }

    const currentValue =
      fallbackData?.value && typeof fallbackData.value === "object" && !Array.isArray(fallbackData.value)
        ? (fallbackData.value as { entries?: unknown })
        : { entries: [] };

    const currentEntries = Array.isArray(currentValue.entries)
      ? currentValue.entries
      : [];

    const nextEntries = currentEntries.filter((entry) => {
      if (!entry || typeof entry !== "object") {
        return true;
      }

      const record = entry as Record<string, unknown>;
      const recordEmail =
        typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
      const recordSubscribedAt =
        typeof record.subscribedAt === "string" ? record.subscribedAt.trim() : "";

      return !(recordEmail === email && recordSubscribedAt === subscribedAt);
    });

    const { error: saveFallbackError } = await adminClient!.from("site_settings").upsert(
      {
        key: "guestlist_signups",
        value: { entries: nextEntries },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (saveFallbackError) {
      buildSettingsRedirect(
        saveFallbackError.message || "We couldn’t delete this guestlist email yet.",
        "error",
        "settings:guestlist"
      );
    }
  }

  revalidatePath("/backoffice/settings");
  revalidatePath("/backoffice/settings/guestlist");

  buildSettingsRedirect(
    "Guestlist email deleted.",
    "success",
    "settings:guestlist"
  );
}
