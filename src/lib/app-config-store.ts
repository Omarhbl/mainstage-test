import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { APP_DEFAULTS, APP_SECTIONS, type AppSection, type AppSections } from "@/lib/app-config";

export async function getAppSettings() {
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("App settings storage is not configured.");
  const { data, error } = await client.from("site_settings").select("key,value,updated_at").in("key", APP_SECTIONS.map(section => `app_${section}`));
  if (error) throw new Error("App settings could not be loaded. Please try again.");
  const sections: AppSections = structuredClone(APP_DEFAULTS);
  let updatedAt: string | null = null;
  for (const row of data ?? []) {
    const section = row.key.replace(/^app_/, "") as AppSection;
    if (APP_SECTIONS.includes(section)) Object.assign(sections, { [section]: row.value });
    if (row.updated_at && (!updatedAt || row.updated_at > updatedAt)) updatedAt = row.updated_at;
  }
  return { sections, updatedAt };
}
export async function saveAppSection(section: AppSection, value: AppSections[AppSection]) {
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("App settings storage is not configured.");
  const { error } = await client.from("site_settings").upsert({ key: `app_${section}`, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error("The settings could not be saved. Your previous settings remain active.");
}
