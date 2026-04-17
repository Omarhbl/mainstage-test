import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { refreshFeedsIfNeeded } from "@/lib/feed-sync";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret) {
    console.error("CRON_SECRET is not set");
    return false;
  }

  return authHeader === `Bearer ${secret}`;
}

function revalidateFeedSurfaces() {
  revalidatePath("/");
  revalidatePath("/music");
  revalidatePath("/music/top-50");
  revalidatePath("/backoffice");
  revalidatePath("/backoffice/feeds");
  revalidatePath("/backoffice/homepage");
}

export async function GET(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const force = ["1", "true", "yes"].includes(
      searchParams.get("force")?.toLowerCase() ?? ""
    );
    const serviceParam = searchParams.get("service")?.toLowerCase();
    const service =
      serviceParam === "youtube" || serviceParam === "spotify"
        ? serviceParam
        : "all";

    const result = await refreshFeedsIfNeeded({ force, service });
    revalidateFeedSurfaces();

    return NextResponse.json({
      success: true,
      mode: "cron-job-org",
      service,
      ...result,
    });
  } catch (error) {
    console.error("CRON ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
