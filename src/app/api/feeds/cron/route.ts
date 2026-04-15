import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { refreshFeedsIfNeeded } from "@/lib/feed-sync";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
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
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized cron request.",
      },
      { status: 401 }
    );
  }

  try {
    const result = await refreshFeedsIfNeeded();
    revalidateFeedSurfaces();

    return NextResponse.json({
      success: true,
      mode: "cron",
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Scheduled feed refresh failed.",
      },
      { status: 500 }
    );
  }
}

