"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

type TickerItem = {
  title: string;
  href: string;
};

export default function Ticker({ items }: { items: TickerItem[] }) {
  const tickerRef = useRef<HTMLDivElement>(null);
  const news = items.filter((item) => item.title.trim() && item.href.trim());

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker || news.length === 0) return;

    const width = ticker.scrollWidth / 2;

    const animation = gsap.to(ticker, {
      x: -width,
      duration: 30,
      ease: "none",
      repeat: -1,
    });

    return () => {
      animation.kill();
    };
  }, [news]);

  if (news.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden border-b border-[#9f171c] bg-[#CE2127] py-2 select-none">
      <div 
        ref={tickerRef} 
        className="flex whitespace-nowrap will-change-transform"
      >
        {[...news, ...news].map((item, i) => (
          <Link
            key={i} 
            href={item.href}
            className="flex items-center px-8 font-header text-[11px] font-bold tracking-[0.24em] text-white uppercase transition-opacity hover:opacity-85"
          >
            <span className="mr-4 h-1.5 w-1.5 rounded-full bg-white" />
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
