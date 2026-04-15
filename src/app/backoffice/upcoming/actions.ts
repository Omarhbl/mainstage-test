"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  FALLBACK_ENTERTAINMENT_UPCOMING,
  UPCOMING_RELEASES,
  type UpcomingItem,
  type UpcomingSettings,
} from "@/lib/upcoming";

function buildUpcomingRedirect(
  section: "cinema" | "events" | null,
  message: string,
  type: "success" | "error"
) {
  const params = new URLSearchParams({ notice: message, type });
  const pathname = section ? `/backoffice/upcoming/${section}` : "/backoffice/upcoming";
  redirect(`${pathname}?${params.toString()}`);
}

function getFallbackSettings(): UpcomingSettings {
  return {
    cinema: UPCOMING_RELEASES.slice(0, 8),
    entertainment: FALLBACK_ENTERTAINMENT_UPCOMING.slice(0, 8),
  };
}

function parseUpcomingItems(formData: FormData, prefix: "cinema" | "entertainment") {
  const items: UpcomingItem[] = [];
  const slotCount = Number(String(formData.get("slot_count") ?? "0"));
  const totalSlots = Number.isFinite(slotCount) && slotCount > 0 ? slotCount : 0;

  for (let index = 0; index < totalSlots; index += 1) {
    const title = String(formData.get(`${prefix}_title_${index}`) ?? "").trim();
    const releaseDate = String(formData.get(`${prefix}_date_${index}`) ?? "").trim();
    const image = String(formData.get(`${prefix}_image_${index}`) ?? "").trim();
    const href = String(formData.get(`${prefix}_href_${index}`) ?? "").trim();

    if (!title && !releaseDate && !image && !href) {
      continue;
    }

    if (!title || !releaseDate || !image) {
      return {
        error: `Please complete title, release date, and image for every ${prefix} upcoming slot you want to use.`,
      };
    }

    items.push({
      id: `${prefix}-${index + 1}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title,
      releaseDate,
      image,
      href,
    });
  }

  return { items };
}

export async function updateUpcomingSettingsAction(formData: FormData) {
  await requireBackofficeAccess(["admin", "editor"]);
  const section = String(formData.get("section") ?? "").trim();
  const targetSection = section === "cinema" || section === "events" ? section : null;
  const storageSection = targetSection === "events" ? "entertainment" : targetSection;

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildUpcomingRedirect(targetSection, "Missing service role key in .env.local.", "error");
  }

  const fallbackSettings = getFallbackSettings();
  const currentSettings = storageSection
    ? (
        (
          await adminClient!.from("site_settings").select("value").eq("key", "upcoming_settings").maybeSingle()
        ).data?.value as Partial<UpcomingSettings> | undefined
      )
    : undefined;

  const savedSettings: UpcomingSettings = {
    cinema: Array.isArray(currentSettings?.cinema)
      ? currentSettings!.cinema.filter(Boolean) as UpcomingItem[]
      : fallbackSettings.cinema,
    entertainment: Array.isArray(currentSettings?.entertainment)
      ? currentSettings!.entertainment.filter(Boolean) as UpcomingItem[]
      : fallbackSettings.entertainment,
  };

  if (!storageSection) {
    buildUpcomingRedirect(null, "Choose a section before saving upcoming entries.", "error");
  }

if (!storageSection) {
  return buildUpcomingRedirect(targetSection, "Missing storage section", "error");
}

const sectionResult = parseUpcomingItems(formData, storageSection);

if ("error" in sectionResult) {
  return buildUpcomingRedirect(
  targetSection,
  sectionResult.error || "Could not parse upcoming items",
  "error"
);
  
  const nextValue: UpcomingSettings = {
    cinema:
      storageSection === "cinema"
        ? sectionResult.items.length > 0
          ? sectionResult.items
          : fallbackSettings.cinema
        : savedSettings.cinema,
    entertainment:
      storageSection === "entertainment"
        ? sectionResult.items.length > 0
          ? sectionResult.items
          : fallbackSettings.entertainment
        : savedSettings.entertainment,
  };

  const { error } = await adminClient!.from("site_settings").upsert(
    {
      key: "upcoming_settings",
      value: nextValue,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

if (error) {
  return buildUpcomingRedirect(
    targetSection,
    error.message || "We couldn’t save the upcoming settings yet.",
    "error"
  );
}

revalidatePath("/backoffice/upcoming");
revalidatePath("/backoffice/upcoming/cinema");
revalidatePath("/backoffice/upcoming/events");
revalidatePath("/cinema");
revalidatePath("/events");

return buildUpcomingRedirect(
  targetSection,
  "Upcoming strip updated successfully.",
  "success"
); 
}
}
