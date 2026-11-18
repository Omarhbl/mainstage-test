import { RADIO_BASE, parseRadioSnapshot } from "@/lib/website-radio";

// Live metadata must bypass both the Next data cache and the CDN/browser cache.
// Fixed public endpoint: no credentials or arbitrary URL proxying.
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const response = await fetch(`${RADIO_BASE}/api/nowplaying/mainstage`, {
      cache: "no-store", signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Radio unavailable");
    return Response.json(parseRadioSnapshot(await response.json()), {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return Response.json({ error: "Radio information is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
