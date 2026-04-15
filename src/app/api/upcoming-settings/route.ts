import { NextResponse } from "next/server";
import { getUpcomingSettings } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getUpcomingSettings();
  return NextResponse.json(settings);
}
