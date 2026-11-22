import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { google } from "googleapis";
import { createPrivateKey } from "node:crypto";

export async function GET() {
  await requireBackofficeAccess(["admin", "editor"]);
  let stage: "key" | "authentication" | "report" = "key";
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

    createPrivateKey(privateKey);
    stage = "authentication";
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });

    await auth.authorize();
    stage = "report";
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
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    const setupCode = stage === "key" ? "INVALID_PRIVATE_KEY" : stage === "authentication" ? "AUTHENTICATION_FAILED" : status === 403 ? "REPORT_ACCESS_DENIED" : status === 404 ? "PROPERTY_NOT_FOUND" : "REPORT_UNAVAILABLE";
    console.error("GA reporting request failed:", setupCode);

    return Response.json(
      { error: "Google Analytics reporting is unavailable.", setupCode },
      { status: 503, headers: { "Cache-Control": "private, no-store" } }
    );
  }
}
