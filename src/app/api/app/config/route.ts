import { getAppSettings } from "@/lib/app-config-store";
import { publicAppConfig } from "@/lib/app-config";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const { sections, updatedAt } = await getAppSettings();
    return Response.json(publicAppConfig(sections, updatedAt), { headers: { "Cache-Control": "public, max-age=60", "Access-Control-Allow-Origin": "*" } });
  } catch {
    return Response.json({ error: "App configuration is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" } });
  }
}
