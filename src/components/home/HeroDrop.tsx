"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";

const TRENDING_CARDS = [
  { id: 1, tag: "ALBUM DROP", title: "Inkonnu reframe le chaos avec une esthétique plus glaciale", image: "/Artists/inkonnu.jpg" },
  { id: 2, tag: "COMEBACK", title: "Shobee reprend l'espace avec un retour plus précis que nostalgique", image: "/Artists/shobee.jpg" },
  { id: 3, tag: "SPOTTED", title: "Manal reste l'obsession visuelle de la semaine", image: "/Artists/manal.jpg" },
];

const SHOW_TRENDING_PANEL = false;

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
    <section className="relative flex min-h-[68vh] w-full items-end overflow-hidden border-b border-border-main">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-x-0 bottom-0 z-10 h-[40%] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.24)_28%,rgba(0,0,0,1)_100%)]" />
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="h-full w-full scale-[1.02] object-cover object-center"
        >
          <source src="/videos/intro.mp4" type="video/mp4" />
        </video>
        <div className="scanline" />
      </div>

      {/* Content */}
      <div className="container relative z-20 grid gap-10 px-4 py-12 md:px-8">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="max-w-4xl text-[30px] font-body font-bold tracking-[-0.03em] text-white leading-[1.08]">
              Inside Kanye West&apos;s Most Controversial Show Yet in LA
            </h2>
            <p className="mt-1 text-[15px] font-body font-semibold leading-none text-[#CE2127]">
              Music
            </p>
          </motion.div>
        </div>

        {SHOW_TRENDING_PANEL && (
          <div className="relative hidden xl:block">
            <div className="absolute -inset-6 bg-primary/10 blur-3xl" />
            <div className="relative border border-border-main bg-white/84 p-5 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-header text-[10px] font-bold tracking-[0.3em] text-primary uppercase">Now trending</h3>
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#8d867f]">03 stories</span>
              </div>
              <div className="space-y-4">
                {TRENDING_CARDS.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="group flex items-center gap-4 border border-border-main bg-[#fbf7f1] p-3 transition-colors hover:border-primary/40 hover:bg-white"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden bg-[#ece5dd]">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-header font-bold tracking-[0.22em] text-primary uppercase">{card.tag}</span>
                      <h4 className="mt-1 text-[15px] leading-5 text-[#161616]">
                        {card.title}
                      </h4>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full-Screen Feed Modal */}
      <AnimatePresence>
        {isFeedOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
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
                <div className="absolute bottom-12 left-12 max-w-xl">
                  <p className="font-header text-[10px] font-bold tracking-[0.28em] text-primary uppercase">Immersive feed mode</p>
                  <h3 className="mt-3 text-4xl font-display italic uppercase leading-none text-text-primary">
                    Coupe le bruit.
                    <span className="block text-primary">Regarde la culture bouger.</span>
                  </h3>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
