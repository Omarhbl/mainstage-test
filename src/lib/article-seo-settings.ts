import "server-only";
import { cache } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type ArticleSeoSettings = { title: string; description: string };
export const getArticleSeoSettings = cache(async (slug: string): Promise<ArticleSeoSettings> => {
  const client = createSupabaseAdminClient();
  if (!client) return { title: "", description: "" };
  const { data } = await client.from("site_settings").select("value").eq("key", `article_seo:${slug}`).maybeSingle();
  const value = data?.value;
  return { title: typeof value?.title === "string" ? value.title : "", description: typeof value?.description === "string" ? value.description : "" };
});

export async function saveArticleSeoSettings(slug: string, form: FormData) {
  const client = createSupabaseAdminClient();
  if (!client) return "SEO settings storage is unavailable.";
  const { error } = await client.from("site_settings").upsert({ key: `article_seo:${slug}`, value: {
    title: String(form.get("seo_title") ?? "").trim().slice(0, 200),
    description: String(form.get("seo_description") ?? "").trim().slice(0, 500),
  }, updated_at: new Date().toISOString() }, { onConflict: "key" });
  return error ? "SEO settings could not be saved. Please try saving the article again." : null;
}
