"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { getInstagramFeed } from "@/lib/instagram-feed";

export async function refreshInstagramAction() {
  await requireBackofficeAccess(["admin", "editor"]);
  const feed = await getInstagramFeed(true);
  revalidatePath("/");
  revalidatePath("/backoffice/homepage/social");
  const notice = !feed.configured ? "Add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID in Vercel, then redeploy." : feed.error || "Instagram highlights refreshed successfully.";
  redirect(`/backoffice/homepage/social?${new URLSearchParams({ notice, type: feed.configured && !feed.error ? "success" : "error" })}`);
}
