import { google } from "googleapis";

export async function GET() {
  try {
    const propertyId = process.env.GA_PROPERTY_ID;
    const clientEmail = process.env.GA_CLIENT_EMAIL;
    const privateKeyRaw = process.env.GA_PRIVATE_KEY;
    const privateKey = privateKeyRaw?.replace(/\\n/g, "\n");
    

    if (!propertyId || !clientEmail || !privateKey) {
      return Response.json(
        {
          error: "Missing Google Analytics environment variables.",
          debug: {
            testEnv: process.env.TEST_ENV || null,
            hasPropertyId: Boolean(propertyId),
            hasClientEmail: Boolean(clientEmail),
            hasPrivateKeyRaw: Boolean(privateKeyRaw),
            hasPrivateKeyProcessed: Boolean(privateKey),
          },
        },
        { status: 500 }
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

    return Response.json(response.data);
  } catch (error) {
    console.error("GA realtime API error:", error);

    return Response.json(
      { error: "Failed to fetch Google Analytics realtime data." },
      { status: 500 }
    );
  }
}
