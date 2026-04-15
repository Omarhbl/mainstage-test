import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/supabase/server";

export async function GET() {
  const siteSettings = await getSiteSettings();

  return NextResponse.json(siteSettings, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
