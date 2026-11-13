import { NextResponse } from "next/server";
import { getCinemaFeed } from "@/lib/cinema-feed";

export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json(await getCinemaFeed(), { headers: { "Cache-Control": "no-store" } });
}
