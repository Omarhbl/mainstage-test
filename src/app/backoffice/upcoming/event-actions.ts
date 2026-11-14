"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { getEventFeed } from "@/lib/event-feed";
export async function refreshEventsAction() {
  await requireBackofficeAccess(["admin", "editor"]);
  const feed = await getEventFeed(true);
  revalidatePath("/events");
  revalidatePath("/backoffice/upcoming/events");
  redirect(`/backoffice/upcoming/events?${new URLSearchParams({ notice: feed.error || `Event listings refreshed: ${feed.items.length} events. See connection status below for each platform.`, type: feed.error ? "error" : "success" })}`);
}
