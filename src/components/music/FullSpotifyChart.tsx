"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Play, Search, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FULL_CHART_DATA = [
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
  { id: 11, rank: 11, prevRank: 12, title: "Action", artist: "Bo9al", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200", views: "154K", status: "up" },
  { id: 12, rank: 12, prevRank: 11, title: "NGHAMER", artist: "Dollypran", image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=200", views: "142K", status: "down" },
  { id: 13, rank: 13, prevRank: 15, title: "Parano", artist: "Manal", image: "/Artists/manal.jpg", views: "135K", status: "up" },
  { id: 14, rank: 14, prevRank: 13, title: "RIRI&ROCKY", artist: "7liwa", image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=200", views: "128K", status: "down" },
  { id: 15, rank: 15, prevRank: 14, title: "Dorororo", artist: "Najm", image: "https://images.unsplash.com/photo-1514525253361-bee8a197c0c1?auto=format&fit=crop&q=80&w=200", views: "121K", status: "down" },
  { id: 16, rank: 16, prevRank: 18, title: "Raindance", artist: "Gustavo 51", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200", views: "116K", status: "up" },
  { id: 17, rank: 17, prevRank: 16, title: "Mizane", artist: "Dave", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200", views: "109K", status: "down" },
  { id: 18, rank: 18, prevRank: 20, title: "WALLAHI", artist: "Tems", image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=200", views: "104K", status: "up" },
  { id: 19, rank: 19, prevRank: 17, title: "#31#", artist: "Inkonnu", image: "/Artists/inkonnu.jpg", views: "98K", status: "down" },
  { id: 20, rank: 20, prevRank: 19, title: "DAZOU LYAM", artist: "Shaw", image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=200", views: "92K", status: "down" },
  { id: 21, rank: 21, prevRank: 23, title: "HELENA", artist: "RnBoi", image: "https://images.unsplash.com/photo-1514525253361-bee8a197c0c1?auto=format&fit=crop&q=80&w=200", views: "87K", status: "up" },
  { id: 22, rank: 22, prevRank: 21, title: "BOOMX3", artist: "ElGrandeToto", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200", views: "84K", status: "down" },
  { id: 23, rank: 23, prevRank: 25, title: "BLUE LOVE", artist: "ElGrandeToto", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200", views: "81K", status: "up" },
  { id: 24, rank: 24, prevRank: 22, title: "3DABI", artist: "Draganov", image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=200", views: "79K", status: "down" },
  { id: 25, rank: 25, prevRank: 24, title: "SO HIGH", artist: "Stormy", image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=200", views: "76K", status: "down" },
  { id: 26, rank: 26, prevRank: 28, title: "GOD DAYM", artist: "Inkonnu", image: "/Artists/inkonnu.jpg", views: "73K", status: "up" },
  { id: 27, rank: 27, prevRank: 26, title: "STALINE", artist: "ElGrandeToto", image: "https://images.unsplash.com/photo-1514525253361-bee8a197c0c1?auto=format&fit=crop&q=80&w=200", views: "71K", status: "down" },
  { id: 28, rank: 28, prevRank: 30, title: "BON COURAGE", artist: "Draganov", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200", views: "69K", status: "up" },
  { id: 29, rank: 29, prevRank: 27, title: "MA VIDA", artist: "21 Tach", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200", views: "67K", status: "down" },
  { id: 30, rank: 30, prevRank: 29, title: "BOUHALI", artist: "LFERDA", image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=200", views: "65K", status: "down" },
  { id: 31, rank: 31, prevRank: 33, title: "INSOMNIA HOTEL", artist: "Najm", image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=200", views: "63K", status: "up" },
  { id: 32, rank: 32, prevRank: 31, title: "Souvenir", artist: "7ari", image: "https://images.unsplash.com/photo-1514525253361-bee8a197c0c1?auto=format&fit=crop&q=80&w=200", views: "61K", status: "down" },
  { id: 33, rank: 33, prevRank: 35, title: "KEDA", artist: "Inkonnu", image: "/Artists/inkonnu.jpg", views: "59K", status: "up" },
  { id: 34, rank: 34, prevRank: 32, title: "SWIM", artist: "BTS", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200", views: "57K", status: "down" },
  { id: 35, rank: 35, prevRank: 34, title: "DIPLOMATICO", artist: "ElGrandeToto", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200", views: "54K", status: "down" },
  { id: 36, rank: 36, prevRank: 38, title: "TABOUT", artist: "KALIL", image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=200", views: "52K", status: "up" },
  { id: 37, rank: 37, prevRank: 36, title: "PIRATE", artist: "Stormy", image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=200", views: "49K", status: "down" },
  { id: 38, rank: 38, prevRank: 40, title: "Tach", artist: "Draganov", image: "https://images.unsplash.com/photo-1514525253361-bee8a197c0c1?auto=format&fit=crop&q=80&w=200", views: "47K", status: "up" },
  { id: 39, rank: 39, prevRank: 37, title: "DEPART", artist: "Dizzy DROS", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200", views: "45K", status: "down" },
  { id: 40, rank: 40, prevRank: 39, title: "TWINS", artist: "Stormy", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200", views: "42K", status: "down" },
  { id: 41, rank: 41, prevRank: 43, title: "YOU KNOW ME", artist: "Inkonnu", image: "/Artists/inkonnu.jpg", views: "39K", status: "up" },
  { id: 42, rank: 42, prevRank: 41, title: "RBI M3ANA", artist: "Stormy", image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=200", views: "36K", status: "down" },
  { id: 43, rank: 43, prevRank: 45, title: "Zahri", artist: "Inkonnu", image: "/Artists/inkonnu.jpg", views: "34K", status: "up" },
  { id: 44, rank: 44, prevRank: 42, title: "YING YUNG", artist: "Inkonnu", image: "/Artists/inkonnu.jpg", views: "31K", status: "down" },
  { id: 45, rank: 45, prevRank: 44, title: "Tsswirtek", artist: "Draganov", image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=200", views: "29K", status: "down" },
  { id: 46, rank: 46, prevRank: 48, title: "Sahran lil", artist: "Cheb Momo", image: "https://images.unsplash.com/photo-1514525253361-bee8a197c0c1?auto=format&fit=crop&q=80&w=200", views: "27K", status: "up" },
  { id: 47, rank: 47, prevRank: 46, title: "Ma Jolie", artist: "LFERDA", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200", views: "24K", status: "down" },
  { id: 48, rank: 48, prevRank: 50, title: "Babydoll", artist: "Dominic Fike", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200", views: "21K", status: "up" },
  { id: 49, rank: 49, prevRank: 47, title: "STYLE", artist: "Inkonnu", image: "/Artists/inkonnu.jpg", views: "19K", status: "down" },
  { id: 50, rank: 50, prevRank: 49, title: "Rosalinda", artist: "Didine Canon 16", image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=200", views: "17K", status: "down" },
];

export default function FullSpotifyChart() {
  const [search, setSearch] = useState("");

  const filteredData = FULL_CHART_DATA.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full bg-surface/30 border border-border-main backdrop-blur-sm min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 p-6 bg-void/80 backdrop-blur-md border-b border-border-main flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <Link href="/music" className="p-2 hover:bg-surface rounded-full transition-colors text-text-muted hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
            <h2 className="text-4xl md:text-5xl font-display text-text-primary tracking-tighter uppercase italic">
              Full Top <span className="text-primary italic">50 Morocco</span>
            </h2>
          </div>
          <p className="text-[10px] font-header text-text-muted tracking-[0.2em] uppercase ml-12">
            Daily Update • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text"
            placeholder="SEARCH ARTIST OR TRACK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-void border border-border-main rounded-none px-10 py-3 text-[11px] font-header tracking-widest text-text-primary focus:outline-none focus:border-primary transition-all uppercase"
          />
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
              <th className="px-6 py-4 text-[10px] font-header font-bold text-text-muted tracking-widest uppercase text-right">STREAMS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-main/50">
            <AnimatePresence mode="popLayout">
              {filteredData.map((item, i) => (
                <motion.tr 
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i < 20 ? i * 0.02 : 0 }}
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
            </AnimatePresence>
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-text-muted font-header tracking-widest uppercase">No tracks found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
