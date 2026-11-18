import { RADIO_BASE, parseRadioSnapshot } from "@/lib/website-radio";

// Fixed public endpoint: no credentials or arbitrary URL proxying. Cache across listeners.
export async function GET() {
  try {
    const response = await fetch(`${RADIO_BASE}/api/nowplaying/mainstage`, {
      next: { revalidate: 15 }, signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Radio unavailable");
    return Response.json(parseRadioSnapshot(await response.json()), {
      headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=15" },
    });
  } catch {
    return Response.json({ error: "Radio information is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
