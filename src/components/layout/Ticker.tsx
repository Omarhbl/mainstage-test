"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const news = [
  "DERNIERE MINUTE: La scène urbaine marocaine accélère encore",
  "LIVE: Shobee relance la conversation avec un retour plus froid et plus calculé",
  "CASABLANCA: Les nuits culturelles deviennent le vrai terrain des tendances",
  "EXCLU: Focus backstage sur la nouvelle génération d'artistes marocains",
  "HOT TAKE: Le style, la musique et le cinéma fusionnent enfin dans le même feed",
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
    <div className="w-full overflow-hidden border-b border-[#9f171c] bg-[#CE2127] py-2 select-none">
      <div 
        ref={tickerRef} 
        className="flex whitespace-nowrap will-change-transform"
      >
        {[...news, ...news].map((item, i) => (
          <span 
            key={i} 
            className="flex items-center px-8 font-header text-[11px] font-bold tracking-[0.24em] text-white uppercase"
          >
            <span className="mr-4 h-1.5 w-1.5 rounded-full bg-white" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
