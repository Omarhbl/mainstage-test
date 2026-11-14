import { getEventFeed } from "@/lib/event-feed";
import { refreshEventsAction } from "@/app/backoffice/upcoming/event-actions";
import FormSubmitButton from "@/components/backoffice/FormSubmitButton";
export default async function EventFeedPanel() {
  const feed = await getEventFeed();
  return <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
    <h2 className="text-[22px] font-body font-bold">Automatic Moroccan events</h2>
    <p className="mt-2 text-sm leading-relaxed text-black/60">Upcoming events are checked every six hours when the site is visited. Unavailable platforms are retried hourly. Past events are removed and duplicate listings are merged. Entries added manually below also appear in the listing.</p>
    <p className="mt-3 text-sm font-semibold">{feed.items.length} upcoming events</p>
    <ul className="mt-4 space-y-3">{feed.sources.map((source) => <li key={source.id} className="border-b border-black/5 pb-3 text-sm"><strong>{source.name}</strong> · {source.error ? "Not connected" : `Connected · ${source.items.length} events`}{source.error ? <p className="mt-1 text-xs text-[#9f1b20]">{source.error}</p> : null}</li>)}</ul>
    {feed.error ? <p className="mt-3 text-sm text-[#9f1b20]">{feed.error}</p> : null}
    <form action={refreshEventsAction} className="mt-4"><FormSubmitButton label="Refresh event listings" pendingLabel="Refreshing event listings..." /></form>
  </div>;
}
