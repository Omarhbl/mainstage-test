"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Music, Flame, Users, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Music", href: "/music", icon: Music },
  { name: "Gossip", href: "/gossip", icon: Flame, isSpecial: true },
  { name: "Artists", href: "/artists", icon: Users },
  { name: "Profile", href: "/profile", icon: PlusCircle },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-[72px] bg-void/80 backdrop-blur-2xl border-t border-border-main lg:hidden pb-safe">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 group transition-all duration-300",
                isActive ? "text-primary" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <div className={cn(
                "relative flex items-center justify-center",
                item.isSpecial && "bg-primary rounded-full p-2 translate-y-[-12px] shadow-lg shadow-primary-glow"
              )}>
                <Icon 
                  size={item.isSpecial ? 24 : 22} 
                  strokeWidth={isActive ? 2 : 1.5}
                  className={cn(
                    item.isSpecial ? "text-black" : "transition-transform group-active:scale-95"
                  )}
                />
                {isActive && !item.isSpecial && (
                  <span className="absolute -bottom-1.5 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-header font-bold tracking-widest mt-1 uppercase",
                item.isSpecial && "hidden",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
