import { getEventFeed } from "@/lib/event-feed";
import { refreshEventsAction } from "@/app/backoffice/upcoming/event-actions";
import FormSubmitButton from "@/components/backoffice/FormSubmitButton";
import { getEventDiscovery } from "@/lib/event-discovery";
export default async function EventFeedPanel() {
  const feed = await getEventFeed();
  const discovery = await getEventDiscovery();
  const drafts = discovery.feed?.sources.flatMap((source) => source.drafts) ?? [];
  return <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
    <h2 className="text-[22px] font-body font-bold">Automatic Moroccan events</h2>
    <p className="mt-2 text-sm leading-relaxed text-black/60">Upcoming events are checked every six hours when the site is visited. Unavailable platforms are retried hourly. Past events are removed and duplicate listings are merged. Entries added manually below also appear in the listing.</p>
    <p className="mt-3 text-sm font-semibold">{feed.items.length} upcoming events</p>
    <ul className="mt-4 space-y-3">{feed.sources.map((source) => <li key={source.id} className="border-b border-black/5 pb-3 text-sm"><strong>{source.name}</strong> · {source.error ? "Not connected" : `${source.method === "search" ? "Search discovery" : "Connected"} · ${source.items.length} events`}{source.error ? <p className="mt-1 text-xs text-[#9f1b20]">{source.error}</p> : null}</li>)}</ul>
    <div className="mt-5 border-t border-black/10 pt-5">
      <h3 className="font-semibold">Daily event discovery</h3>
      <p className="mt-1 text-sm text-black/60">Search finds Moroccan events from iTicket, Ticket.ma, webook and Events.ma daily. Listings with a clear date, location and matching poster appear automatically. Search results may lag behind changes; ticket availability is confirmed by the ticketing site.</p>
      {discovery.error ? <p className="mt-2 text-sm text-[#9f1b20]">{discovery.error}</p> : null}
      <p className="mt-3 text-sm font-semibold">{drafts.length} listings need review</p>
      {drafts.length ? <p className="mt-1 text-xs text-black/60">Check the source, then add a complete entry using the manual fields below. Review candidates are not published automatically.</p> : null}
      <ul className="mt-3 space-y-3">{drafts.map((draft) => <li key={draft.url} className="rounded-lg border border-black/10 p-3 text-sm">
        <a href={draft.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#CE2127] underline">{draft.title}</a>
        <p className="mt-1 text-xs text-black/60">{draft.reasons.join(" · ")}</p>
        {draft.evidence ? <details className="mt-2 text-xs text-black/60"><summary className="cursor-pointer">View discovered details</summary><p className="mt-2 whitespace-pre-wrap">{draft.evidence}</p></details> : null}
      </li>)}</ul>
    </div>
    {feed.error ? <p className="mt-3 text-sm text-[#9f1b20]">{feed.error}</p> : null}
    <form action={refreshEventsAction} className="mt-4"><FormSubmitButton label="Refresh event listings" pendingLabel="Refreshing event listings..." /></form>
  </div>;
}
