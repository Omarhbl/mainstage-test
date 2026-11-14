import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { validateDiscoveryFeed, type DiscoveryFeed } from "@/lib/event-feed-data";

export async function getEventDiscovery(force = false): Promise<{ feed: DiscoveryFeed | null; error: string | null }> {
  const client = createSupabaseAdminClient();
  if (!client) return { feed: null, error: "Event discovery storage is unavailable." };
  const { data } = await client.from("site_settings").select("value").eq("key", "morocco_event_discovery_v1").maybeSingle();
  const saved = data?.value as { feed?: unknown; checkedAt?: string } | undefined;
  let previous: DiscoveryFeed | null = null;
  try { previous = validateDiscoveryFeed(saved?.feed); } catch { /* No current feed. */ }
  if (!force && previous && Date.now() - Date.parse(saved?.checkedAt ?? "") < 60 * 60 * 1000) return { feed: previous, error: null };
  try {
    const response = await fetch("https://raw.githubusercontent.com/Omarhbl/mainstage-test/main/src/data/event-discovery.json", { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("Unavailable");
    const feed = validateDiscoveryFeed(await response.json());
    const { error } = await client.from("site_settings").upsert({ key: "morocco_event_discovery_v1", value: { feed, checkedAt: new Date().toISOString() }, updated_at: new Date().toISOString() }, { onConflict: "key" });
    return { feed, error: error ? "Discovery results could not be cached." : null };
  } catch {
    return { feed: previous, error: previous ? "Latest discovery results could not be loaded; showing the previous import." : "Waiting for the first successful daily search import. Save TAVILY_API_KEY in GitHub Actions secrets, then run Discover Moroccan Events." };
  }
}
