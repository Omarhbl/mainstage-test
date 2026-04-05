"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

const TRENDING_CARDS = [
  { id: 1, tag: "ALBUM DROP", title: "Inkonnu: 27 Personas in SPLIT", image: "/Artists/inkonnu.jpg" },
  { id: 2, tag: "MUSIC", title: "Shobee: Machi M3ana Comeback", image: "/Artists/shobee.jpg" },
  { id: 3, tag: "GOSSIP", title: "Manal x L'Algerino: The Truth?", image: "/Artists/manal.jpg" },
];

export default function HeroDrop() {
  const [isFeedOpen, setIsFeedOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFeedOpen(false);
    };
    if (isFeedOpen) {
      window.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent scroll
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isFeedOpen]);

  return (
    <section className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden border-b border-border-main/50">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-void/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent z-10" />
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover scale-105"
        >
          <source src="/videos/intro.mp4" type="video/mp4" />
        </video>
        <div className="scanline" />
      </div>

      {/* Content */}
      <div className="container relative z-20 px-4 md:px-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <span className="inline-block px-4 py-1 bg-primary text-black font-header font-bold text-[10px] tracking-[0.2em] mb-6 animate-pulse">
            THE DROP • LIVE NOW
          </span>
          <h2 className="text-6xl md:text-9xl font-display text-text-primary tracking-tighter leading-[0.85] uppercase italic">
            Moroccan <br />
            <span className="text-primary drop-shadow-[0_0_30px_rgba(255,107,0,0.5)]">Pulse</span>
          </h2>
          <p className="mt-8 text-lg md:text-xl font-body text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Your backstage pass to the sounds, stories, and scenes defining a generation. 
            From the streets of Casablanca to the global stage.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          onClick={() => setIsFeedOpen(true)}
          className="mt-12 group relative flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 group-hover:bg-primary/40 transition-all" />
          <div className="relative w-20 h-20 bg-primary rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
            <Play fill="black" className="ml-1" size={32} />
          </div>
          <span className="ml-6 font-header font-bold tracking-widest text-text-primary group-hover:text-primary transition-colors">PLAY THE FEED</span>
        </motion.button>
      </div>

      {/* Trending Sidebar */}
      <div className="absolute bottom-12 left-8 z-30 hidden xl:flex flex-col space-y-4">
        <h3 className="text-[10px] font-header font-bold tracking-[0.3em] text-text-muted mb-2">NOW TRENDING</h3>
        {TRENDING_CARDS.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + (i * 0.1) }}
            className="group relative w-64 h-20 bg-surface/40 backdrop-blur-md border border-border-main p-3 flex items-center space-x-4 cursor-pointer hover:bg-surface/60 transition-all"
          >
            <div className="relative w-14 h-14 overflow-hidden bg-void">
              <img src={card.image} alt={card.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-header font-bold text-primary tracking-widest">{card.tag}</span>
              <h4 className="text-[11px] font-header text-text-primary font-bold truncate leading-tight mt-1 uppercase italic tracking-tight">
                {card.title}
              </h4>
            </div>
            <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-300" />
          </motion.div>
        ))}
      </div>

      {/* Full-Screen Feed Modal */}
      <AnimatePresence>
        {isFeedOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          >
            {/* Modal Exit Button - Primary Pinpoint Exit */}
            <button 
              onClick={() => setIsFeedOpen(false)}
              className="absolute top-6 right-6 z-[10000] w-12 h-12 flex items-center justify-center bg-void/60 backdrop-blur-xl rounded-full text-white/70 hover:text-primary hover:bg-void transition-all border border-white/10 group active:scale-95 shadow-2xl"
              aria-label="Close modal"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Immersive Video Feed */}
            <div 
              className="absolute inset-0 w-full h-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <video 
                autoPlay 
                loop 
                className="w-full h-full object-cover"
              >
                <source src="/videos/intro.mp4" type="video/mp4" />
              </video>

              {/* Overlay Logo/UI over the video */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute top-12 left-12">
                   <Link href="/" className="flex flex-col items-start">
                     <span className="text-[8px] font-mono tracking-[0.3em] text-primary mb-[-2px]">THE</span>
                     <h1 className="text-xl md:text-2xl font-display tracking-tighter text-text-primary leading-none">
                       MAINSTAGENT
                     </h1>
                   </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
