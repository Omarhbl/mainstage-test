import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { google } from "googleapis";

export async function GET() {
  await requireBackofficeAccess(["admin", "editor"]);
  try {
    const propertyId = process.env.GA_PROPERTY_ID;
    const clientEmail = process.env.GA_CLIENT_EMAIL;
    const privateKeyRaw = process.env.GA_PRIVATE_KEY;
    const privateKey = privateKeyRaw?.replace(/\\n/g, "\n");
    

    if (!propertyId || !clientEmail || !privateKey) {
      return Response.json(
        {
          error: "Analytics is temporarily unavailable.",
        },
        { status: 503, headers: { "Cache-Control": "private, no-store" } }
      );
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });

    const analyticsData = google.analyticsdata({
      version: "v1beta",
      auth,
    });

    const [daily, response] = await Promise.all([
      analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: "today", endDate: "today" }],
          metrics: [{ name: "sessions" }],
        },
      }, { timeout: 10000, retry: false }),
      analyticsData.properties.runRealtimeReport({
      property: `properties/${propertyId}`,
      requestBody: {
        metrics: [{ name: "activeUsers" }],
      },
      }, { timeout: 10000, retry: false }).catch(() => null),
    ]);
    const sessions = Number(daily.data.rows?.[0]?.metricValues?.[0]?.value ?? 0);
    const activeUsers = response ? Number(response.data.rows?.[0]?.metricValues?.[0]?.value ?? 0) : null;
    if (!Number.isFinite(sessions) || (activeUsers !== null && !Number.isFinite(activeUsers))) throw new Error("Invalid report");

    return Response.json({ ...response?.data, traffic: { sessions, activeUsers } }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    console.error("GA realtime API request failed.");

    return Response.json(
      { error: "Failed to fetch Google Analytics realtime data." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } }
    );
  }
}
