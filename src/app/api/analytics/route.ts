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

    const response = await analyticsData.properties.runRealtimeReport({
      property: `properties/${propertyId}`,
      requestBody: {
        metrics: [{ name: "activeUsers" }],
      },
    });

    return Response.json(response.data, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    console.error("GA realtime API request failed.");

    return Response.json(
      { error: "Failed to fetch Google Analytics realtime data." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } }
    );
  }
}
