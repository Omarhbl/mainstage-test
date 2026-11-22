"use client";

import { useEffect, useState } from "react";
import StatCard from "./StatCard";

type Traffic = { sessions: number; activeUsers: number | null };

export default function WebsiteTrafficCard() {
  const [traffic, setTraffic] = useState<Traffic | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let busy = false;
    async function refresh() {
      if (busy || document.hidden) return;
      busy = true;
      try {
        const response = await fetch("/api/analytics", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Reporting unavailable");
        const data = await response.json();
        if (!Number.isFinite(data.traffic?.sessions)) throw new Error("Invalid report");
        setTraffic(data.traffic);
        setFailed(false);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      } finally {
        busy = false;
      }
    }
    void refresh();
    const timer = window.setInterval(refresh, 60000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const online = traffic?.activeUsers;
  return <StatCard
    label="Website visits today"
    value={traffic ? traffic.sessions.toLocaleString("en-US") : "--"}
    hint={failed ? traffic ? "Last available report. Refresh temporarily unavailable." : "Analytics is temporarily unavailable." : traffic ? `Google Analytics sessions today.${online === null ? "" : ` ${online} active in the last 30 minutes.`} Updates every minute; today's totals may be delayed.` : "Loading Google Analytics…"}
  />;
}
