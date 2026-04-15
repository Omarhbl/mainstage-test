import { NextResponse } from "next/server";
import { getPublicArticles } from "@/lib/public-articles";

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await getPublicArticles();

  return NextResponse.json({ articles });
}
