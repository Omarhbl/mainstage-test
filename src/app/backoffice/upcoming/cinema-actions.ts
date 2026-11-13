"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { getCinemaFeed } from "@/lib/cinema-feed";

export async function refreshCinemaAction() {
  await requireBackofficeAccess(["admin", "editor"]);
  const feed = await getCinemaFeed(true);
  revalidatePath("/cinema");
  revalidatePath("/backoffice/upcoming/cinema");
  redirect(`/backoffice/upcoming/cinema?${new URLSearchParams({ notice: feed.error || `Cinema listings refreshed: ${feed.movies.length} films.`, type: feed.error ? "error" : "success" })}`);
}
