import SpotifyChart from "@/components/music/SpotifyChart";
import MusicNews from "@/components/music/MusicNews";
import SiteFooter from "@/components/layout/SiteFooter";
import { getPublicArticles } from "@/lib/public-articles";
import { getFeedSettings } from "@/lib/supabase/server";

export default async function MusicPage() {
  const publicArticles = await getPublicArticles();
  const feedSettings = await getFeedSettings();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1 pb-20">
        <div className="mx-auto max-w-[1116px] px-4 py-16 md:px-6 md:py-20">
          <div
            className="mx-auto mb-12 max-w-[760px] text-center"
            style={{ color: "#1a1a1a" }}
          >
            <h1
              className="text-[31px] font-body font-bold tracking-[-0.03em] !text-[#1a1a1a]"
              style={{ color: "#1a1a1a" }}
            >
              Music
            </h1>
            <p
              className="mt-4 text-[17px] font-body font-normal leading-[1.7] !text-[rgba(0,0,0,0.72)]"
              style={{ color: "rgba(0,0,0,0.72)" }}
            >
              Follow the releases, movements, and artists shaping the soundtrack of now, from headline moments to the shifts changing the scene.
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-[minmax(0,1fr)_438px] xl:gap-20">
            <div className="min-w-0">
              <section>
                <MusicNews initialArticles={publicArticles} />
              </section>
            </div>

            <aside className="w-full lg:pt-0">
              <div className="lg:sticky lg:top-24">
                <SpotifyChart tracks={feedSettings.spotify.tracks.slice(0, 10)} />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
