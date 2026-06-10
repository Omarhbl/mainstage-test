"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Search, Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Trending", href: "/trending" },
  { name: "Music", href: "/music" },
  { name: "Cinema", href: "/cinema" },
  { name: "People", href: "/people" },
  { name: "Sport", href: "/sport" },
  { name: "Events", href: "/events" },
  { name: "Culture", href: "/culture" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuTop, setMobileMenuTop] = useState(72);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const updateMenuTop = () => {
      const navBottom = navRef.current?.getBoundingClientRect().bottom ?? 72;
      setMobileMenuTop(Math.max(0, Math.round(navBottom)));
    };
    const scrollY = window.scrollY;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    updateMenuTop();
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("resize", updateMenuTop);

    return () => {
      window.removeEventListener("resize", updateMenuTop);
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [mobileMenuOpen]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    router.push(`/search?q=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setMobileMenuOpen(false);
  }

  function isActiveLink(href: string) {
    if (pathname === href) {
      return true;
    }

    if (href !== "/" && pathname.startsWith(`${href}/`)) {
      return true;
    }

    return false;
  }

  return (
    <nav
      ref={navRef}
      className={cn(
        "sticky top-0 z-[80] w-full border-b transition-all duration-300",
        isScrolled 
          ? "border-black/10 bg-[#111111]/94 py-3 backdrop-blur-xl" 
          : "border-transparent bg-[#111111] py-4"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="group relative flex cursor-pointer items-center">
          <img
            src="/mainstage-logo.png"
            alt="Mainstagent"
            className="h-auto w-[158px] md:w-[182px]"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex flex-1 items-center justify-center space-x-10">
          {NAV_LINKS.map((link) => (
            (() => {
              const isActive = isActiveLink(link.href);

              return (
            <Link 
              key={link.name} 
              href={link.href}
              className={cn(
                "group relative cursor-pointer text-[13px] font-body tracking-[0.01em] transition-colors hover:text-white",
                isActive ? "font-bold text-white" : "font-medium text-white/70"
              )}
            >
              {link.name}
              <span
                className={cn(
                  "absolute -bottom-2 left-0 h-[2px] bg-[#CE2127] transition-all duration-300 group-hover:w-full",
                  "w-0"
                )}
              />
            </Link>
              );
            })()
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 md:gap-6">
          <div className="hidden md:block">
            <AnimatePresence initial={false} mode="wait">
              {searchOpen ? (
                <motion.form
                  key="search-form"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 320 }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  onSubmit={handleSearchSubmit}
                  className="flex h-[40px] items-center overflow-hidden rounded-full border border-white/15 bg-white/6 pl-4 pr-2 backdrop-blur-xl"
                >
                  <Search size={16} strokeWidth={1.7} className="shrink-0 text-white/55" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    autoFocus
                    placeholder="Search articles..."
                    className="w-full bg-transparent px-3 text-[13px] font-body text-white placeholder:text-white/45 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                  className="cursor-pointer rounded-full p-1 text-white/55 transition-colors hover:text-white"
                    aria-label="Close search"
                  >
                    <X size={15} strokeWidth={1.8} />
                  </button>
                </motion.form>
              ) : (
                <motion.button
                  key="search-button"
                  initial={{ opacity: 0.85 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSearchOpen(true)}
                  className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center text-white/70 transition-colors hover:text-white"
                  aria-label="Open search"
                >
                  <Search size={18} strokeWidth={1.5} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setSearchOpen((current) => !current)}
            className="cursor-pointer text-white/70 transition-colors hover:text-white md:hidden"
            aria-label="Toggle search"
          >
            <Search size={18} strokeWidth={1.5} />
          </button>
          <button className="hidden h-[40px] w-[40px] cursor-pointer items-center justify-center text-white/70 transition-colors hover:text-white sm:flex">
            <User size={18} strokeWidth={1.5} />
          </button>
          <button 
            className="cursor-pointer lg:hidden text-white"
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu-panel"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu-panel"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            style={{ top: mobileMenuTop }}
            className="fixed inset-x-0 bottom-0 z-[90] flex flex-col overflow-y-auto bg-[#fffdf9] px-8 pb-10 pt-8 shadow-[0_24px_80px_rgba(0,0,0,0.18)] lg:hidden"
          >
            <form onSubmit={handleSearchSubmit} className="flex items-center rounded-full border border-black/10 bg-white px-4 py-3">
              <Search size={18} strokeWidth={1.7} className="text-black/45" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search articles..."
                className="w-full bg-transparent px-3 text-[15px] font-body text-[#181818] placeholder:text-black/35 focus:outline-none"
              />
            </form>

            {NAV_LINKS.map((link) => (
              (() => {
                const isActive = isActiveLink(link.href);

                return (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 }}
              >
                <Link 
                  href={link.href}
                  className={cn(
                    "block cursor-pointer py-1 text-4xl font-display tracking-[-0.05em] transition-colors hover:text-primary",
                    isActive ? "font-bold text-[#181818]" : "text-text-primary"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              </motion.div>
                );
              })()
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
