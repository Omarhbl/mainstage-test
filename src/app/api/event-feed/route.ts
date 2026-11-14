import { NextResponse } from "next/server";
import { getEventFeed } from "@/lib/event-feed";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json(await getEventFeed(), { headers: { "Cache-Control": "no-store" } });
}
