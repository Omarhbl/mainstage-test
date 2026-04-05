"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const news = [
  "BREAKING: DIZZY DROS DROPS NEW SURPRISE ALBUM NIGHTFALL",
  "SAAD LAMJARRED REACHES 1B VIEWS ON YOUTUBE",
  "MOROCCAN FASHION WEEK: COSA TO REVEAL FALL '26 COLLECTION",
  "EXCLUSIVE: BEHIND THE SCENES WITH EL GRANDE TOTO",
  "HOT: NEW COLLAB ALERT — MANAL X L'ALGERINO",
];

export default function Ticker() {
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    const width = ticker.scrollWidth / 2;

    gsap.to(ticker, {
      x: -width,
      duration: 30,
      ease: "none",
      repeat: -1,
    });
  }, []);

  return (
    <div className="w-full bg-primary py-2 overflow-hidden border-b border-black/10 select-none">
      <div 
        ref={tickerRef} 
        className="flex whitespace-nowrap will-change-transform"
      >
        {[...news, ...news].map((item, i) => (
          <span 
            key={i} 
            className="flex items-center text-black font-display text-sm tracking-widest px-8"
          >
            <span className="w-2 h-2 bg-black rotate-45 mr-4" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
