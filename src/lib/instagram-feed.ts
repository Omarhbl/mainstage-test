import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { parseInstagramHighlights, type InstagramHighlight } from "@/lib/instagram-feed-data";

const INTERVAL = 15 * 60 * 1000;
const MAX_STALE = 24 * 60 * 60 * 1000;
type Snapshot = { items: InstagramHighlight[]; syncedAt: string | null; checkedAt: string; error: string | null };
export type InstagramFeed = Snapshot & { configured: boolean };

export async function getInstagramFeed(force = false): Promise<InstagramFeed> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const userId = process.env.INSTAGRAM_USER_ID?.trim();
  const empty: InstagramFeed = { configured: Boolean(token && userId), items: [], syncedAt: null, checkedAt: "", error: null };
  if (!token || !userId) return empty;
  const client = createSupabaseAdminClient();
  if (!client) return { ...empty, error: "The feed needs the site's database connection." };
  const { data, error: readError } = await client.from("site_settings").select("value").eq("key", "instagram_feed").maybeSingle();
  if (readError) return { ...empty, error: "Could not read the saved Instagram feed." };
  const saved = data?.value as Partial<Snapshot> | undefined;
  const syncedAt = typeof saved?.syncedAt === "string" && Number.isFinite(Date.parse(saved.syncedAt)) ? saved.syncedAt : null;
  const checkedAt = typeof saved?.checkedAt === "string" ? saved.checkedAt : "";
  const recent = syncedAt && Date.now() - Date.parse(syncedAt) < MAX_STALE;
  // Validate stored media again before passing it to the public page.
  const items = recent && Array.isArray(saved?.items) ? parseInstagramHighlights({ data: saved.items.filter((item) => item && typeof item === "object").map((item) => ({ media_url: item.image, permalink: item.href, caption: item.alt })) }) : [];
  if (!force && Date.now() - Date.parse(checkedAt) < INTERVAL) {
    return { ...empty, items, syncedAt, checkedAt, error: typeof saved?.error === "string" ? saved.error : null };
  }
  let next: Snapshot;
  try {
    if (!/^\d+$/.test(userId)) throw new Error("Invalid Instagram account ID. Check INSTAGRAM_USER_ID in Vercel.");
    const url = new URL(`https://graph.facebook.com/v27.0/${userId}/media`);
    url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
    url.searchParams.set("limit", "25");
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(6000) });
    const payload = await response.json();
    if (!response.ok || payload.error) {
      const code = Number(payload?.error?.code);
      throw new Error(code === 190 ? "Instagram authorization expired or was revoked. Generate a new token and update Vercel." : code === 10 || code === 200 ? "Instagram denied access. Check the app's permissions and account authorization." : "Instagram could not refresh the feed. Check the account ID, token, and app access.");
    }
    const fresh = parseInstagramHighlights(payload);
    if (!fresh.length) throw new Error("Instagram returned no displayable posts. The saved highlights are still being used.");
    const now = new Date().toISOString();
    next = { items: fresh, syncedAt: now, checkedAt: now, error: null };
  } catch (error) {
    // Never include upstream responses or request headers in errors: they may contain credentials.
    const message = error instanceof Error && ["Invalid Instagram", "Instagram "].some((prefix) => error.message.startsWith(prefix)) ? error.message : "Instagram is temporarily unavailable. The saved highlights are still being used.";
    next = { items, syncedAt, checkedAt: new Date().toISOString(), error: message };
  }
  const { error: saveError } = await client.from("site_settings").upsert({ key: "instagram_feed", value: next, updated_at: new Date().toISOString() }, { onConflict: "key" });
  return { configured: true, ...next, error: saveError ? "The Instagram feed could not be saved. Check database access." : next.error };
}
