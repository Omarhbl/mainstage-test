import { google } from "googleapis";

export async function GET() {
  try {
    const propertyId = process.env.GA_PROPERTY_ID;
    const clientEmail = process.env.GA_CLIENT_EMAIL;
    const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!propertyId || !clientEmail || !privateKey) {
      return Response.json(
        { error: "Missing Google Analytics environment variables." },
        { status: 500 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });

    const analyticsData = google.analyticsdata("v1beta");
    const authClient = await auth.getClient();

    const response = await analyticsData.properties.runRealtimeReport({
      auth: authClient,
      property: `properties/${propertyId}`,
      requestBody: {
        metrics: [{ name: "activeUsers" }],
      },
    });

    return Response.json(response.data);
  } catch (error) {
    console.error("GA realtime API error:", error);

    return Response.json(
      { error: "Failed to fetch Google Analytics realtime data." },
      { status: 500 }
    );
  }
}
