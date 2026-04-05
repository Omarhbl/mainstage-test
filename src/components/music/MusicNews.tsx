"use client";

import { motion } from "framer-motion";
import { Mic2, Radio, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const MUSIC_NEWS = [
  { id: 1, type: "spotlight", artist: "Inkonnu", title: "SPLIT: 15 Tracks, 27 Personas — The Return of Morocco's Most Introspective Voice", image: "/articles/Inkonnu.jpg", tag: "ALBUM DROP", date: "NEW" },
  { id: 2, type: "news", artist: "Shobee", title: "Machi M3ana: Shobee Breaks 3-Year Hiatus with a Trap/DnB Masterclass", image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800", tag: "HOT RELEASE", date: "MARCH 29" },
  { id: 3, type: "news", artist: "Travis Scott", title: "Cactus Jack to Headline 'Atlas Beats' Festival in Marrakech", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800", tag: "GLOBAL", date: "1D AGO" },
  { id: 4, type: "news", artist: "Manal", title: "Manal Announces 2026 European Tour 'Arabian Queen'", image: "https://images.unsplash.com/photo-1514525253361-bee8a197c0c1?auto=format&fit=crop&q=80&w=800", tag: "TOUR", date: "5H AGO" },
];

export default function MusicNews() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border-main pb-4">
        <h2 className="text-3xl font-display text-text-primary uppercase italic tracking-tighter">
          Music <span className="text-secondary">Pulse</span>
        </h2>
        <div className="flex space-x-6 text-[10px] font-header font-bold tracking-[0.2em] text-text-muted uppercase">
          <span className="text-secondary border-b border-secondary pb-1 cursor-pointer">LATEST</span>
          <span className="hover:text-text-primary transition-colors cursor-pointer">MOROCCAN</span>
          <span className="hover:text-text-primary transition-colors cursor-pointer">GLOBAL</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Spotlight Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="md:col-span-2 group relative h-[500px] overflow-hidden bg-surface border border-border-main cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent z-10" />
          <img src={MUSIC_NEWS[0].image} alt={MUSIC_NEWS[0].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60" />
          <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20">
            <span className="inline-block px-3 py-1 bg-secondary text-black font-header font-bold text-[9px] tracking-widest mb-6 uppercase">
              {MUSIC_NEWS[0].tag}
            </span>
            <h3 className="text-4xl md:text-6xl font-display text-text-primary tracking-tighter uppercase italic leading-none group-hover:text-secondary transition-colors">
              {MUSIC_NEWS[0].title}
            </h3>
            <div className="mt-6 flex items-center space-x-6 text-[10px] font-header font-bold text-text-secondary tracking-widest uppercase">
              <span className="flex items-center"><Mic2 size={12} className="mr-2" /> {MUSIC_NEWS[0].artist}</span>
              <span className="flex items-center"><Calendar size={12} className="mr-2" /> {MUSIC_NEWS[0].date}</span>
            </div>
          </div>
        </motion.div>

        {/* Regular News Cards */}
        {MUSIC_NEWS.slice(1).map((news, i) => (
          <motion.div 
            key={news.id}
            whileHover={{ y: -6 }}
            className="group grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface/30 border border-border-main p-4 cursor-pointer hover:border-secondary/50 transition-colors"
          >
            <div className="relative h-48 md:h-full w-full overflow-hidden bg-void">
              <img src={news.image} alt={news.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70" />
              <div className="absolute top-3 left-3 bg-void/80 backdrop-blur-md text-[8px] font-header font-bold text-secondary px-2 py-1 tracking-widest uppercase border border-border-main">
                {news.tag}
              </div>
            </div>
            <div className="flex flex-col justify-between py-2">
              <div>
                <span className="text-[9px] font-header font-bold text-text-muted tracking-widest uppercase mb-2 block">
                  {news.artist}
                </span>
                <h4 className="text-lg font-header font-bold text-text-primary uppercase italic tracking-tight leading-tight group-hover:text-secondary transition-colors">
                  {news.title}
                </h4>
              </div>
              <div className="mt-4 flex items-center justify-between text-[9px] font-header font-bold text-text-muted tracking-widest uppercase">
                <span>{news.date}</span>
                <Radio size={14} className="text-secondary" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12">
        <ArtistRadar name="INKONNU" subtitle="Visual Storyteller" image="https://images.unsplash.com/photo-1520127877998-122c33e8eb38?auto=format&fit=crop&q=80&w=400" />
        <ArtistRadar name="SHOBEE" subtitle="The Prodigal Son" image="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400" />
        <ArtistRadar name="STORMY" subtitle="Flow Specialist" image="https://images.unsplash.com/photo-1514525253361-bee8a197c0c1?auto=format&fit=crop&q=80&w=400" />
      </div>
    </div>
  );
}

function ArtistRadar({ name, subtitle, image }: { name: string; subtitle: string; image: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="group relative h-64 overflow-hidden border border-border-main p-6 flex flex-col items-center justify-end text-center cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent z-10" />
      <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-700" />
      <div className="relative z-20">
        <span className="text-[8px] font-header font-bold text-secondary tracking-[0.3em] uppercase block mb-2">ARTIST RADAR</span>
        <h5 className="text-2xl font-display text-text-primary uppercase italic leading-none">{name}</h5>
        <p className="text-[9px] font-header text-text-secondary tracking-widest uppercase mt-2">{subtitle}</p>
      </div>
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <TrendingUp size={16} className="text-secondary" />
      </div>
    </motion.div>
  );
}
