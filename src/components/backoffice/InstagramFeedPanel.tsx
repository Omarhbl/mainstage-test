import { getInstagramFeed } from "@/lib/instagram-feed";
import { refreshInstagramAction } from "@/app/backoffice/homepage/instagram-actions";
import FormSubmitButton from "@/components/backoffice/FormSubmitButton";

export default async function InstagramFeedPanel() {
  const feed = await getInstagramFeed();
  return (
    <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
      <h2 className="text-[22px] font-body font-bold">Automatic Instagram highlights</h2>
      <p className="mt-2 text-sm leading-relaxed text-black/60">The five newest available posts from your connected account appear on the homepage. Updates are checked every 15 minutes when the site is visited. Images below remain available as a fallback.</p>
      <p className="mt-3 text-sm font-semibold">{!feed.configured ? "Not connected" : feed.error ? "Connection needs attention" : feed.items.length ? `Connected · ${feed.items.length} posts available` : "Waiting for Instagram posts"}</p>
      {!feed.configured ? <p className="mt-2 text-sm text-black/60">Add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID in Vercel and deploy to connect the feed.</p> : null}
      {feed.error ? <p className="mt-2 text-sm text-[#9f1b20]">{feed.error}</p> : null}
      {feed.syncedAt ? <p className="mt-2 text-xs text-black/50">Last successful update: {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Casablanca" }).format(new Date(feed.syncedAt))}</p> : null}
      {feed.items.length ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">{feed.items.map((item) => <a key={item.href} href={item.href} target="_blank" rel="noreferrer"><img src={item.image} alt={item.alt} className="aspect-[322/401] w-full rounded-lg object-cover" /></a>)}</div> : null}
      <form action={refreshInstagramAction} className="mt-4"><FormSubmitButton label="Refresh Instagram" pendingLabel="Refreshing Instagram..." /></form>
    </div>
  );
}
