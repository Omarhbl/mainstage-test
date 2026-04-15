"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, ChevronDown, ChevronUp, Minus } from "lucide-react";
import Link from "next/link";
import { SPOTIFY_MOROCCO_TRACKS, SPOTIFY_MOROCCO_URL } from "@/lib/spotify";

function formatPlays(value?: number | null) {
  if (typeof value !== "number") {
    return "—";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

function ChartMovement({ value }: { value?: string }) {
  if (!value || value === "=") {
    return (
      <span className="inline-flex items-center justify-center text-white/35">
        <Minus size={14} strokeWidth={2.4} />
      </span>
    );
  }

  const isUp = value.startsWith("+");

  return (
    <span className={`inline-flex items-center justify-center ${isUp ? "text-green-600" : "text-[#CE2127]"}`}>
      {isUp ? <ChevronUp size={16} strokeWidth={2.6} /> : <ChevronDown size={16} strokeWidth={2.6} />}
    </span>
  );
}

export default function FullSpotifyChart() {
  const [search, setSearch] = useState("");

  const filteredData = SPOTIFY_MOROCCO_TRACKS.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full overflow-hidden rounded-[18px] border border-white/8 bg-[#141415] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
      <div className="sticky top-0 z-30 flex flex-col justify-between gap-6 border-b border-white/8 bg-[#19191b]/95 p-6 backdrop-blur-md md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center space-x-4">
            <Link
              href="/music"
              className="rounded-full bg-white/5 p-2 text-white/55 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={20} />
            </Link>
            <h2 className="text-4xl font-body font-bold tracking-[-0.05em] text-white md:text-5xl">
              TOP 50 MOROCCO
            </h2>
          </div>
          <p className="ml-12 text-[10px] font-header uppercase tracking-[0.2em] text-white/35">
            Synced from Spotify Morocco playlist
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
          />
          <input
            type="text"
            placeholder="SEARCH ARTIST OR TRACK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-none border border-white/10 bg-[#101011] px-10 py-3 text-[11px] font-header uppercase tracking-widest text-white transition-all placeholder:text-white/35 focus:border-[#CE2127] focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/8 bg-[#181819]">
              <th className="px-6 py-4 text-[10px] font-header font-bold uppercase tracking-widest text-white/45">
                #
              </th>
              <th className="px-6 py-4 text-[10px] font-header font-bold uppercase tracking-widest text-white/45">
                TITLE
              </th>
              <th className="hidden px-6 py-4 text-[10px] font-header font-bold uppercase tracking-widest text-white/45 md:table-cell">
                ARTIST
              </th>
              <th className="hidden px-6 py-4 text-center text-[10px] font-header font-bold uppercase tracking-widest text-white/45 sm:table-cell">
                CHART
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-header font-bold uppercase tracking-widest text-white/45">
                PLAYS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6 bg-[#141415]">
            <AnimatePresence mode="popLayout">
              {filteredData.map((item, i) => (
                <motion.tr
                  layout
                  key={`${item.rank}-${item.title}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i < 20 ? i * 0.02 : 0 }}
                  className={`group cursor-pointer transition-colors ${
                    i % 2 === 0 ? "bg-[#151517]" : "bg-[#111113]"
                  } hover:bg-white/[0.04]`}
                >
                  <td className="px-6 py-4">
                    <span className="text-[18px] font-body font-semibold leading-none tracking-[-0.03em] text-white/70">
                      {item.rank.replace("#", "").padStart(2, "0")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[4px] transition-transform group-hover:scale-105">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-body font-medium tracking-[-0.02em] text-white leading-tight">
                          {item.title}
                        </h4>
                        <p className="mt-1 text-[13px] font-body text-white/60 md:hidden">
                          {item.artist}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <span className="text-[14px] font-body font-normal text-white/65">
                      {item.artist}
                    </span>
                  </td>
                  <td className="hidden px-6 py-4 text-center sm:table-cell">
                    <ChartMovement value={item.chartChange} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-[15px] font-body font-medium tabular-nums text-white">
                        {formatPlays(item.plays)}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-header uppercase tracking-widest text-white/45">
              No tracks found matching &quot;{search}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
