"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, Play, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const CHART_DATA = [
  { id: 1, rank: 1, prevRank: 1, title: "WARDA", artist: "Inkonnu", image: "/Artists/inkonnu.jpg", views: "345K", status: "stable" },
  { id: 2, rank: 2, prevRank: 3, title: "KALIMAT", artist: "Manal", image: "/Artists/manal.jpg", views: "312K", status: "up" },
  { id: 3, rank: 3, prevRank: 2, title: "TJENENY", artist: "Inkonnu", image: "/Artists/inkonnu.jpg", views: "289K", status: "down" },
  { id: 4, rank: 4, prevRank: 5, title: "DFN", artist: "Inkonnu", image: "/Artists/inkonnu.jpg", views: "276K", status: "up" },
  { id: 5, rank: 5, prevRank: 0, title: "Machi M3ana", artist: "Shobee", image: "/Artists/shobee.jpg", views: "254K", status: "new" },
  { id: 6, rank: 6, prevRank: 4, title: "MOON", artist: "Stormy", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200", views: "231K", status: "down" },
  { id: 7, rank: 7, prevRank: 9, title: "MOOD", artist: "Inkonnu", image: "/Artists/inkonnu.jpg", views: "218K", status: "up" },
  { id: 8, rank: 8, prevRank: 10, title: "Bali maak", artist: "Amine Farsi", image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=200", views: "198K", status: "up" },
  { id: 9, rank: 9, prevRank: 7, title: "KOULCHI HOUN", artist: "Inkonnu", image: "/Artists/inkonnu.jpg", views: "187K", status: "down" },
  { id: 10, rank: 10, prevRank: 8, title: "TAF TAF", artist: "Stormy", image: "https://images.unsplash.com/photo-1514525253361-bee8a197c0c1?auto=format&fit=crop&q=80&w=200", views: "176K", status: "down" },
];

export default function SpotifyChart() {
  return (
    <div className="w-full bg-surface/30 border border-border-main backdrop-blur-sm">
      <div className="flex items-center justify-between p-6 border-b border-border-main">
        <div>
          <h2 className="text-3xl font-display text-text-primary tracking-tighter uppercase italic">
            Top 50 <span className="text-primary italic">Spotify MA</span>
          </h2>
          <p className="text-[10px] font-header text-text-muted tracking-[0.2em] uppercase mt-1">
            Weekly Updated • April 6, 2026
          </p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-void border border-border-main rounded-full">
          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
          <span className="text-[9px] font-header font-bold text-text-secondary tracking-widest uppercase">LIVE STATS</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-main bg-void/50">
              <th className="px-6 py-4 text-[10px] font-header font-bold text-text-muted tracking-widest uppercase">#</th>
              <th className="px-6 py-4 text-[10px] font-header font-bold text-text-muted tracking-widest uppercase">SONG</th>
              <th className="px-6 py-4 text-[10px] font-header font-bold text-text-muted tracking-widest uppercase hidden md:table-cell">ARTIST</th>
              <th className="px-6 py-4 text-[10px] font-header font-bold text-text-muted tracking-widest uppercase text-center hidden sm:table-cell">CHART</th>
              <th className="px-6 py-4 text-[10px] font-header font-bold text-text-muted tracking-widest uppercase text-right">VIEWS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-main/50">
            {CHART_DATA.slice(0, 5).map((item, i) => (
              <motion.tr 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group hover:bg-surface transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-2xl font-display font-bold leading-none",
                    item.rank <= 3 ? "text-primary" : "text-text-muted"
                  )}>
                    {item.rank.toString().padStart(2, '0')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-12 h-12 flex-shrink-0 group-hover:scale-105 transition-transform">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-sm" />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play size={16} fill="white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-header font-bold text-text-primary uppercase italic tracking-tight leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-[10px] font-body text-text-secondary md:hidden uppercase mt-1">
                        {item.artist}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                   <span className="text-[11px] font-header font-bold text-text-secondary tracking-widest uppercase">
                     {item.artist}
                   </span>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell text-center">
                  <div className="flex items-center justify-center space-x-2">
                    {item.status === 'up' && <TrendingUp size={14} className="text-secondary" />}
                    {item.status === 'down' && <TrendingDown size={14} className="text-primary" />}
                    {item.status === 'stable' && <Minus size={14} className="text-text-muted" />}
                    {item.status === 'new' && (
                      <span className="bg-secondary text-black text-[8px] font-bold px-1.5 py-0.5 rounded-sm">NEW</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-[11px] font-body text-text-primary font-bold">
                    {item.views}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-6 border-t border-border-main bg-surface/50 flex justify-center">
        <Link 
          href="/music/top-50"
          className="group flex items-center space-x-4 px-8 py-3 bg-void border border-border-main hover:border-primary transition-all"
        >
          <span className="text-[10px] font-header font-bold tracking-[0.3em] text-text-primary group-hover:text-primary">VIEW FULL TOP 50</span>
          <ExternalLink size={14} className="text-primary" />
        </Link>
      </div>
    </div>
  );
}
