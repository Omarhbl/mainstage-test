"use client";

import { motion } from "framer-motion";

export default function MusicHero() {
  return (
    <section className="relative h-[40vh] w-full flex items-center justify-center overflow-hidden bg-surface">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-void/80 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=2000" 
          alt="Music Background" 
          className="w-full h-full object-cover opacity-50 contrast-125"
        />
        <div className="scanline" />
      </div>

      <div className="container relative z-20 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <span className="inline-block px-3 py-1 bg-secondary text-black font-header font-bold text-[10px] tracking-widest mb-4">
            MUSIC HUB
          </span>
          <h1 className="text-5xl md:text-7xl font-display text-text-primary tracking-tighter uppercase italic leading-none">
            The Sound <br /> 
            <span className="text-secondary">of the Maghreb</span>
          </h1>
          <p className="mt-4 text-text-secondary font-body max-w-md">
            The most influential charts, latest drops, and deep dives into the artists shaping Moroccan culture.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
