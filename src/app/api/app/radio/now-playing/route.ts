import { getAppSettings } from "@/lib/app-config-store";
import { appRadioNowPlaying } from "@/lib/app-radio-data";
import { RADIO_BASE, RADIO_STREAM, parseRadioSnapshot } from "@/lib/website-radio";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store, max-age=0", "Access-Control-Allow-Origin": "*" };
export async function GET() {
  try {
    const { sections } = await getAppSettings();
    // A changed stream must not accidentally display Mainstage's track metadata.
    if (sections.radio.streamUrl !== RADIO_STREAM) {
      return Response.json({ error: "Automatic metadata is available for the Mainstage live stream. Use the configured metadata override for another station." }, { status: 503, headers });
    }
    const response = await fetch(`${RADIO_BASE}/api/nowplaying/mainstage`, {
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Metadata unavailable");
    return Response.json(appRadioNowPlaying(parseRadioSnapshot(await response.json()), sections.radio), { headers });
  } catch {
    return Response.json({ error: "Radio metadata is temporarily unavailable." }, { status: 503, headers });
  }
}
