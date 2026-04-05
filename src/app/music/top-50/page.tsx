"use client";

import FullSpotifyChart from "@/components/music/FullSpotifyChart";

export default function Top50Page() {
  return (
    <main className="min-h-screen bg-void selection:bg-primary selection:text-black">
      <div className="pt-24 pb-20 container mx-auto px-4 md:px-8">
        <FullSpotifyChart />
      </div>

      {/* Background radial glow */}
      <div className="fixed top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-secondary/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
    </main>
  );
}
