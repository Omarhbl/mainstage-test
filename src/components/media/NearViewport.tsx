"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Reserve the strip's space, loading offscreen third-party media near the reader. */
export default function NearViewport({ children }: { children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!host.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setReady(true); observer.disconnect(); }
    }, { rootMargin: "600px" });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={host} className="min-h-[401px]">{ready ? children : null}</div>;
}
