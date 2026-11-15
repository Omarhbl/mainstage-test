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
    <section aria-labelledby="submission-notifications-title" className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="submission-notifications-title" className="text-[24px] font-body font-bold tracking-[-0.04em]">New submissions <span className="ml-2 rounded-full bg-[#CE2127] px-3 py-1 text-[15px] text-white" aria-live="polite">{data ? count : "—"}</span></h2>
        <button type="button" onClick={markRead} disabled={!count || pending} className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold disabled:opacity-40">{pending ? "Saving…" : "Mark all as read"}</button>
      </div>
      <p className="mt-2 text-sm text-black/55">Guestlist signups and contact messages. Checks for updates every minute.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/backoffice/settings/guestlist" className="rounded-xl bg-[#faf8f6] px-4 py-3 font-semibold">Guestlist · {data?.guestlistCount ?? "—"} new</Link>
        <Link href="/backoffice/settings/contact-inbox" className="rounded-xl bg-[#faf8f6] px-4 py-3 font-semibold">Contact inbox · {data?.contactCount ?? "—"} new</Link>
      </div>
      {error ? <p role="status" className="mt-4 text-sm text-[#9f1b20]">{error}</p> : null}
      {data?.items.length ? <ul className="mt-4 divide-y divide-black/8">{data.items.map(item => <li key={item.id}><Link href={item.href} className="flex flex-col gap-1 py-3 hover:text-[#CE2127]"><span className="text-sm font-semibold">{item.title}</span><span className="break-words text-sm text-black/60">{item.detail}</span><time dateTime={item.receivedAt} className="text-xs text-black/45">{new Date(item.receivedAt).toLocaleString("en-GB", { timeZone: "Africa/Casablanca", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</time></Link></li>)}</ul> : data ? <p className="mt-5 text-sm text-black/55">You’re all caught up. New submissions will appear here.</p> : null}
    </section>
  );
}
