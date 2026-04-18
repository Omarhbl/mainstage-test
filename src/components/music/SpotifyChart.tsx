"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, Minus, ArrowRight } from "lucide-react";
import type { SpotifyChartEntry } from "@/lib/feed-data";

function formatPlays(value?: number | null) {
  if (typeof value !== "number") {
    return "—";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

function ChartMovement({ value }: { value?: string }) {
  if (!value || value === "=") {
    return (
      <span className="inline-flex items-center justify-center text-white/60">
        <Minus size={14} strokeWidth={2.4} />
      </span>
    );
  }

  const isUp = value.startsWith("+");

  return (
    <span
      className={`inline-flex items-center justify-center ${
        isUp ? "text-[#56d364]" : "text-[#ff5f56]"
      }`}
    >
      {isUp ? (
        <ChevronUp size={15} strokeWidth={2.8} />
      ) : (
        <ChevronDown size={15} strokeWidth={2.8} />
      )}
    </span>
  );
}

export default function SpotifyChart({
  tracks,
}: {
  tracks: SpotifyChartEntry[];
}) {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-[25px] font-body font-bold tracking-[-0.03em] text-[#181818]">
            On Repeat
          </h2>
          <span className="h-[10px] w-[10px] rounded-full bg-[#CE2127]" />
        </div>

        <Link
          href="/music/top-50"
          className="inline-flex items-center gap-2 text-[16px] font-body font-semibold text-[#CE2127] transition-opacity hover:opacity-80"
        >
          Discover more
          <ArrowRight size={16} strokeWidth={2.2} />
        </Link>
      </div>

      <div className="overflow-hidden rounded-[14px]">
        <div className="grid grid-cols-[108px_minmax(0,1fr)_104px] bg-[#CE2127] px-5 py-4 text-[15px] font-body font-semibold text-white">
          <span>Rank</span>
          <span>Title</span>
          <span>Plays</span>
        </div>

        <div>
          {tracks.map((item, index) => (
            <div
              key={item.rank}
              className={`grid grid-cols-[108px_minmax(0,1fr)_104px] items-center px-5 py-[11px] ${
                index % 2 === 0 ? "bg-[#787878]" : "bg-[#838383]"
              } text-white`}
            >
              <div className="flex items-center gap-2.5 text-[14px] font-body font-medium">
                <span>{item.rank}</span>
                <ChartMovement value={item.chartChange} />
              </div>

              <div className="flex items-center gap-4">
                <div className="h-[40px] w-[40px] overflow-hidden rounded-[4px] bg-black/20">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-body font-medium leading-none">
                    {item.title}
                  </p>
                  <p className="mt-1 truncate text-[11px] font-body font-normal text-white/55">
                    {item.artist}
                  </p>
                  </div>
                </div>

              <div className="flex justify-end">
                <span className="text-[12px] font-body font-semibold leading-none tabular-nums">
                  {formatPlays(item.plays)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
