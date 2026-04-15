"use client";

import { useEffect } from "react";

const ONE_HOUR_MS = 60 * 60 * 1000;

export default function FeedAutoRefreshHeartbeat() {
  useEffect(() => {
    let cancelled = false;

    async function ping() {
      if (cancelled || typeof window === "undefined" || !window.navigator.onLine) {
        return;
      }

      try {
        await fetch("/api/feeds/heartbeat", {
          method: "POST",
          cache: "no-store",
          keepalive: true,
        });
      } catch {
        // Silent by design: the dashboard/feed pages surface health explicitly.
      }
    }

    ping();
    const intervalId = window.setInterval(ping, ONE_HOUR_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return null;
}

