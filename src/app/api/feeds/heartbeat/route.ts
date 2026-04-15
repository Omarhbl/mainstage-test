import { NextResponse } from "next/server";
import { refreshFeedsIfNeeded } from "@/lib/feed-sync";

export const runtime = "nodejs";

export async function POST() {
  try {
    const result = await refreshFeedsIfNeeded();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Feed auto-refresh failed.",
      },
      { status: 500 }
    );
  }
}

