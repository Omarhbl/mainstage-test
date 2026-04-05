"use client";

import { motion } from "framer-motion";
import { Flame, Play, Music, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const FEED_ITEMS = [
  { id: 1, type: "feature", category: "MUSIC", title: "Dizzy DROS's 'Nightfall' is a masterpiece of Moroccan Trap", image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?auto=format&fit=crop&q=80&w=1200", author: "Reda B.", time: "6 min read" },
  { id: 2, type: "standard", category: "CULTURE", title: "Why Casablanca is becoming the new creative hub of North Africa", image: "https://images.unsplash.com/photo-1549194380-f38bde6374f1?auto=format&fit=crop&q=80&w=800", author: "Sara T.", time: "4 min read" },
  { id: 3, type: "gossip", category: "GOSSIP", title: "The Manal x L'Algerino collaboration teaser just broke the internet", image: "https://images.unsplash.com/photo-1520127877998-122c33e8eb38?auto=format&fit=crop&q=80&w=800", author: "Zineb H.", time: "2 min read" },
  { id: 4, type: "album", category: "ALBUM", title: "Yasmine: The Debut", image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=800", artist: "Yasmine", score: "8.5" },
  { id: 5, type: "standard", category: "FASHION", title: "The 5 Moroccan brands you need to follow this season", image: "https://images.unsplash.com/photo-1523381235312-3a1647fa9a42?auto=format&fit=crop&q=80&w=800", author: "Amine M.", time: "5 min read" },
  { id: 6, type: "standard", category: "FILM", title: "Nabil Ayouch's new film: A raw look at urban reality", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800", author: "Omar S.", time: "7 min read" },
];

export default function EditorialGrid() {
  return (
    <section className="container mx-auto px-4 md:px-8 py-20">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Large Feature */}
        <div className="md:col-span-8 lg:col-span-8">
          <FeatureCard item={FEED_ITEMS[0]} />
        </div>

        {/* Sidebar Stack */}
        <div className="md:col-span-4 lg:col-span-4 space-y-8">
          <StandardCard item={FEED_ITEMS[1]} />
          <StandardCard item={FEED_ITEMS[2]} isGossip />
        </div>

        {/* Marquee Strip */}
        <div className="md:col-span-12 my-12 overflow-hidden border-y border-border-main py-8 bg-surface/30">
          <div className="flex items-center space-x-12 animate-marquee-slow whitespace-nowrap">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="text-4xl md:text-6xl font-display text-text-muted hover:text-primary transition-colors cursor-pointer uppercase italic flex items-center">
                <Flame className="mr-4 text-primary" /> HOT GOSSIP 🔥 LIVE FROM THE STREETS
              </span>
            ))}
          </div>
        </div>

        {/* Triple Stack */}
        <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 auto-rows-fr">
          <AlbumCard item={FEED_ITEMS[3]} />
          <StandardCard item={FEED_ITEMS[4]} />
          <StandardCard item={FEED_ITEMS[5]} />
          <div className="relative h-full w-full bg-primary flex flex-col items-center justify-center p-8 text-black group cursor-pointer hover:bg-white transition-colors">
            <PlusCircle className="mb-4 group-hover:rotate-90 transition-transform duration-500" size={48} />
            <span className="font-header font-bold tracking-[0.2em] text-center">JOIN THE MAINSTAGENT MAILING LIST</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ item }: { item: any }) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="group relative h-[600px] w-full overflow-hidden bg-surface cursor-pointer ring-1 ring-border-main/50"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent z-10" />
      <img 
        src={item.image} 
        alt={item.title} 
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
      />
      
      <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 w-full">
        <span className="inline-block px-3 py-1 bg-primary text-black font-header font-bold text-[10px] tracking-widest mb-6">
          {item.category}
        </span>
        <h3 className="text-4xl md:text-6xl font-display text-text-primary tracking-tighter leading-tight uppercase italic group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <div className="mt-8 flex items-center space-x-6 text-sm font-header text-text-secondary tracking-widest uppercase">
          <span>By {item.author}</span>
          <span className="w-1 h-1 bg-text-muted rounded-full" />
          <span>{item.time}</span>
        </div>
      </div>
    </motion.div>
  );
}

function StandardCard({ item, isGossip }: { item: any; isGossip?: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -6 }}
      className={cn(
        "group h-full w-full bg-surface border border-border-main p-4 cursor-pointer hover:border-primary/50 transition-colors",
        isGossip && "border-l-4 border-l-primary"
      )}
    >
      <div className="relative h-48 w-full overflow-hidden mb-6">
        <img src={item.image} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {isGossip && (
          <div className="absolute top-3 left-3 bg-primary text-black p-1.5 rounded-full shadow-lg">
            <Flame size={14} fill="black" />
          </div>
        )}
      </div>
      <span className={cn(
        "text-[10px] font-header font-bold tracking-[0.2em]",
        isGossip ? "text-primary" : "text-text-muted"
      )}>
        {item.category}
      </span>
      <h4 className="mt-3 text-xl font-header font-bold text-text-primary tracking-tight leading-tight uppercase italic group-hover:text-primary transition-colors">
        {item.title}
      </h4>
      <div className="mt-6 flex items-center justify-between">
        <span className="text-[10px] font-header text-text-muted tracking-widest uppercase">By {item.author}</span>
        <Play size={14} className="text-primary group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
}

function AlbumCard({ item }: { item: any }) {
  return (
    <motion.div 
      whileHover={{ rotateY: 10, rotateX: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative perspective-1000 h-full w-full bg-surface/50 border border-border-main p-6 cursor-pointer"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-void shadow-2xl mb-6">
        <img src={item.image} alt={item.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute top-4 right-4 h-12 w-12 bg-white rounded-full flex items-center justify-center text-black font-display text-xl border-4 border-primary shadow-xl">
          {item.score}
        </div>
      </div>
      <span className="flex items-center text-[10px] font-header font-bold text-secondary tracking-widest mb-3">
        <Music size={12} className="mr-2" /> {item.category} • REVIEW
      </span>
      <h4 className="text-2xl font-display text-text-primary uppercase tracking-tight italic group-hover:text-primary transition-colors">
        {item.title}
      </h4>
      <p className="mt-2 text-text-muted font-header text-xs tracking-widest uppercase italic">{item.artist}</p>
    </motion.div>
  );
}
