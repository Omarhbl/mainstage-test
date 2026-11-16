"use server";
import { revalidatePath } from "next/cache";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { APP_SECTIONS, validateAppSection, type AppSection, type AppRadio, type AppWebradio, type AppAd } from "@/lib/app-config";
import { getAppSettings, saveAppSection } from "@/lib/app-config-store";
import { verifyAppImageUrl } from "@/lib/app-media";
export type AppSaveState = { ok: boolean; message: string };
export async function saveAppSettingsAction(_previous: AppSaveState, data: FormData): Promise<AppSaveState> {
  await requireBackofficeAccess(["admin"]);
  try {
    const section = String(data.get("section")) as AppSection;
    if (!APP_SECTIONS.includes(section)) throw new Error("Unknown app section.");
    const raw = String(data.get("settings") ?? ""); if (raw.length > 200000) throw new Error("The settings are too large.");
    const value = validateAppSection(section, JSON.parse(raw));
    if (section === "radio") await verifyAppImageUrl((value as AppRadio).artworkUrl, "radio");
    if (section === "webradios") {
      const { sections } = await getAppSettings();
      const originalIds = JSON.parse(String(data.get("originalIds") ?? "[]")) as string[];
      for (const id of originalIds) if (!sections.webradios.some(item => item.id === id)) throw new Error("The webradio list changed. Reload before saving.");
      // Existing IDs are locked in the form. Removed IDs can be deleted; new IDs create new records.
      const checks = await Promise.allSettled((value as AppWebradio[]).map(item => verifyAppImageUrl(item.imageUrl, "webradio")));
      for (const result of checks) if (result.status === "rejected") throw result.reason;
    }
    if (section === "ads") { const checks = await Promise.allSettled((value as AppAd[]).map(item => verifyAppImageUrl(item.imageUrl, item.slot))); for (const result of checks) if (result.status === "rejected") throw result.reason; }
    await saveAppSection(section, value);
    revalidatePath(`/backoffice/app/${section}`); revalidatePath("/backoffice/app"); revalidatePath("/api/app/config");
    return { ok: true, message: "Saved. Phones receive the update on their next config refresh (about one minute)." };
  } catch (error) { return { ok: false, message: error instanceof Error ? error.message : "Settings could not be saved. Please try again." }; }
}
