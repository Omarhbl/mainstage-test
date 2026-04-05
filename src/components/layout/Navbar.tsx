"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "HOME", href: "/" },
  { name: "MUSIC", href: "/music" },
  { name: "ARTISTS", href: "/artists" },
  { name: "GOSSIP 🔥", href: "/gossip" },
  { name: "CULTURE", href: "/culture" },
  { name: "EXCLUSIVES ⭐", href: "/exclusives" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b",
        isScrolled 
          ? "bg-void/80 backdrop-blur-xl border-border-main py-3" 
          : "bg-transparent border-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group relative flex flex-col items-center">
          <span className="text-[10px] font-mono tracking-[0.3em] text-primary mb-[-4px]">THE</span>
          <h1 className="text-2xl md:text-3xl font-display tracking-tighter text-text-primary leading-none group-hover:animate-glitch transition-all">
            MAINSTAGENT
          </h1>
          <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-300" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-8">
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-xs font-header font-bold tracking-widest text-text-secondary hover:text-primary transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <button className="text-text-secondary hover:text-text-primary transition-colors">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <button className="hidden sm:block text-text-secondary hover:text-text-primary transition-colors">
            <User size={20} strokeWidth={1.5} />
          </button>
          <button 
            className="lg:hidden text-text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-[70px] z-40 bg-void/98 backdrop-blur-2xl lg:hidden flex flex-col p-8 space-y-8"
          >
            {NAV_LINKS.map((link) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Link 
                  href={link.href}
                  className="text-3xl font-display tracking-tight text-text-primary hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
