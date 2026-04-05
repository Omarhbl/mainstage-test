"use client";

import { motion } from "framer-motion";
import MusicHero from "@/components/music/MusicHero";
import SpotifyChart from "@/components/music/SpotifyChart";
import MusicNews from "@/components/music/MusicNews";
import { Clock, TrendingUp } from "lucide-react";

export default function MusicPage() {
  return (
    <main className="min-h-screen bg-void pb-20">
      <MusicHero />
      
      {/* Dynamic Drop Countdown Bar */}
      <div className="w-full bg-secondary py-4 overflow-hidden border-y border-void">
        <div className="flex items-center space-x-12 animate-marquee-slow whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Clock size={16} fill="black" className="text-black" />
              <span className="text-xs font-header font-bold text-black tracking-[0.3em] uppercase italic">
                NOW LIVE: SHOBEE - "MACHI M3ANA" • THE RETURN OF THE PRODIGAL SON
              </span>
              <TrendingUp size={16} className="text-black" />
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Main News Feed (Left) */}
          <div className="lg:col-span-8 space-y-20">
             <section>
               <MusicNews />
             </section>
          </div>

          {/* Sidebar Charts (Right) */}
          <aside className="lg:col-span-4 sticky top-24">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <SpotifyChart />
              
              <div className="mt-8 p-6 bg-surface/50 border border-border-main">
                 <h3 className="text-[10px] font-header font-bold text-secondary tracking-widest uppercase mb-4 mb-4">EDITOR'S PICK</h3>
                 <div className="group relative aspect-video overflow-hidden bg-void">
                    <img 
                      src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=600" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60"
                      alt="Artist spotlight"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                       <span className="text-[9px] font-header text-text-muted tracking-widest uppercase mb-2">ARTIST OF THE MONTH</span>
                       <h4 className="text-2xl font-display text-text-primary uppercase italic">Dizzy DROS</h4>
                    </div>
                 </div>
              </div>
            </motion.div>
          </aside>
          
        </div>
      </div>
    </main>
  );
}
