"use server";

import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { createSupabaseAdminClient, getContactMessages, getGuestlistSignups } from "@/lib/supabase/server";
import { summarizeSubmissions } from "@/lib/submission-notifications";

export async function getSubmissionNotificationsAction() {
  const { user } = await requireBackofficeAccess(["admin"]);
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Notifications are temporarily unavailable.");
  // Capture before reading so a submission arriving during the query stays unread.
  const checkedAt = new Date().toISOString();
  const [guestlist, contacts, marker] = await Promise.all([
    getGuestlistSignups(), getContactMessages(),
    client.from("site_settings").select("value").eq("key", `submission_notifications_seen_${user.id}`).maybeSingle(),
  ]);
  if (marker.error) throw new Error("Could not load notification read status.");
  const seenAt = typeof marker.data?.value?.seenAt === "string" ? marker.data.value.seenAt : "";
  return summarizeSubmissions(guestlist, contacts, seenAt, checkedAt);
}

export async function markSubmissionNotificationsReadAction(checkedAt: string) {
  const { user } = await requireBackofficeAccess(["admin"]);
  const time = Date.parse(checkedAt);
  if (!Number.isFinite(time) || time > Date.now()) throw new Error("Please refresh notifications and try again.");
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Notifications are temporarily unavailable.");
  const { error } = await client.from("site_settings").upsert({ key: `submission_notifications_seen_${user.id}`, value: { seenAt: checkedAt }, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error("Could not mark notifications as read. Please try again.");
}
