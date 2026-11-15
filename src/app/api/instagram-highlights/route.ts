import { NextResponse } from "next/server";
import { getInstagramFeed } from "@/lib/instagram-feed";

export const dynamic = "force-dynamic";

// Public media only, with the same hourly cache as the homepage. Never expose
// tokens, upstream responses or a public force-refresh switch.
export async function GET() {
  const feed = await getInstagramFeed();
  return NextResponse.json({ items: feed.items, syncedAt: feed.syncedAt, configured: feed.configured, refreshFailed: Boolean(feed.error) }, {
    // A saved, usable feed is a successful response even if the background check failed.
    status: feed.items.length ? 200 : !feed.configured ? 503 : feed.error ? 502 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
