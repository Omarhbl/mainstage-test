"use client";

import FullSpotifyChart from "@/components/music/FullSpotifyChart";
import SiteFooter from "@/components/layout/SiteFooter";

export default function Top50Page() {
  return (
    <main className="min-h-screen bg-void selection:bg-primary selection:text-white">
      <div className="container mx-auto px-4 pb-20 pt-24 md:px-8">
        <FullSpotifyChart />
      </div>

      <SiteFooter />

      <div className="fixed right-0 top-0 -z-10 h-[600px] w-[600px] translate-x-1/2 -translate-y-1/2 rounded-full bg-black/4 blur-[150px]" />
      <div className="fixed bottom-0 left-0 -z-10 h-[400px] w-[400px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#CE2127]/8 blur-[140px]" />
    </main>
  );
}
