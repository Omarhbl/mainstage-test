import { getCinemaFeed } from "@/lib/cinema-feed";
import { refreshCinemaAction } from "@/app/backoffice/upcoming/cinema-actions";
import FormSubmitButton from "@/components/backoffice/FormSubmitButton";

export default async function CinemaFeedPanel() {
  const feed = await getCinemaFeed();
  return <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
    <h2 className="text-[22px] font-body font-bold">Automatic Moroccan cinema listings</h2>
    <p className="mt-2 text-sm leading-relaxed text-black/60">Now showing is updated from Megarama’s public schedules in Casablanca, Rabat and Marrakech every six hours when the site is visited. The list below still controls the separate Upcoming tab.</p>
    <p className="mt-3 text-sm font-semibold">{feed.movies.length} films with scheduled screenings{feed.sources.length ? ` · ${feed.sources.join(" · ")}` : ""}</p>
    {feed.error ? <p className="mt-2 text-sm text-[#9f1b20]">{feed.error}</p> : null}
    {feed.syncedAt ? <p className="mt-2 text-xs text-black/50">Last update: {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Casablanca" }).format(new Date(feed.syncedAt))}</p> : null}
    <form action={refreshCinemaAction} className="mt-4"><FormSubmitButton label="Refresh cinema listings" pendingLabel="Refreshing cinema listings..." /></form>
  </div>;
}
