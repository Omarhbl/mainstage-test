"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { getSubmissionNotificationsAction, markSubmissionNotificationsReadAction } from "@/app/backoffice/notification-actions";
import type { SubmissionNotifications as NotificationData } from "@/lib/submission-notifications";

export default function SubmissionNotifications({ initial }: { initial: NotificationData | null }) {
  const [data, setData] = useState(initial);
  const [error, setError] = useState(initial ? "" : "Notifications could not be loaded. Retrying automatically.");
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    let active = true;
    let loading = false;
    const refresh = async () => {
      if (document.visibilityState === "hidden" || loading) return;
      loading = true;
      try { const next = await getSubmissionNotificationsAction(); if (active) { setData(next); setError(""); } }
      catch { if (active) setError("Could not check for new submissions. Retrying automatically."); }
      finally { loading = false; }
    };
    const timer = window.setInterval(() => void refresh(), 60000);
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { active = false; window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, []);
  const count = (data?.guestlistCount ?? 0) + (data?.contactCount ?? 0);
  function markRead() {
    if (!data) return;
    const checkedAt = data.checkedAt;
    startTransition(async () => {
      try {
        await markSubmissionNotificationsReadAction(checkedAt);
        setData(await getSubmissionNotificationsAction()); setError("");
      } catch { setError("Could not update notifications. Please try again."); }
    });
  }
  return (
    <section aria-labelledby="submission-notifications-title" className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-black/8 bg-white px-4 py-3 text-sm">
      <h2 id="submission-notifications-title" className="flex items-center gap-2 font-semibold">
        <span aria-hidden="true" className={`h-2 w-2 rounded-full ${count ? "bg-[#CE2127]" : "bg-black/25"}`} />
        Submissions
        <span aria-live="polite" aria-atomic="true" className={count ? "rounded-full bg-[#CE2127] px-2 py-0.5 text-xs text-white" : "text-xs font-normal text-black/60"}>
          {data ? count ? `${count} new` : "All caught up" : "Checking…"}
        </span>
      </h2>
      <nav aria-label="Submission inboxes" className="flex flex-wrap items-center gap-3 text-xs">
        <Link href="/backoffice/settings/guestlist" className="text-black/70 hover:text-[#CE2127] hover:underline">Guestlist{data?.guestlistCount ? ` (${data.guestlistCount})` : ""}</Link>
        <Link href="/backoffice/settings/contact-inbox" className="text-black/70 hover:text-[#CE2127] hover:underline">Contact{data?.contactCount ? ` (${data.contactCount})` : ""}</Link>
      </nav>
      {count > 0 ? <button type="button" onClick={markRead} disabled={pending} className="ml-auto text-xs font-medium text-black/65 hover:text-[#CE2127] disabled:opacity-40">{pending ? "Saving…" : "Mark as read"}</button> : null}
      {error ? <p role="status" className="w-full text-xs text-[#9f1b20]">{error}</p> : null}
    </section>
  );
}
