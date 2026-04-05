"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Trending", href: "/" },
  { name: "Music", href: "/music" },
  { name: "Cinema", href: "/cinema" },
  { name: "People", href: "/people" },
  { name: "Entertainment", href: "/entertainment" },
  { name: "Culture", href: "/culture" },
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
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        isScrolled 
          ? "border-black/10 bg-[#111111]/94 py-3 backdrop-blur-xl" 
          : "border-transparent bg-[#111111] py-4"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group relative flex items-center">
          <img
            src="/mainstage-logo.png"
            alt="Mainstagent"
            className="h-auto w-[158px] md:w-[182px]"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-10">
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="group relative text-[13px] font-body font-medium tracking-[0.01em] text-white/70 transition-colors hover:text-white"
            >
              {link.name}
              <span className="absolute -bottom-2 left-0 h-[2px] w-0 bg-[#CE2127] group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <button className="text-white/70 transition-colors hover:text-white">
            <Search size={18} strokeWidth={1.5} />
          </button>
          <button className="hidden sm:block text-white/70 transition-colors hover:text-white">
            <User size={18} strokeWidth={1.5} />
          </button>
          <button 
            className="lg:hidden text-white"
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
            className="fixed inset-0 top-[70px] z-40 flex flex-col space-y-8 bg-white/96 p-8 backdrop-blur-2xl lg:hidden"
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
