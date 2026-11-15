"use client";

import { useEffect, useState } from "react";
import type { UpcomingSettings } from "@/lib/upcoming";

export function useUpcomingSettings(initialSettings?: UpcomingSettings) {
  const [settings, setSettings] = useState<UpcomingSettings>(initialSettings ?? {
    cinema: [],
    entertainment: [],
  });

  useEffect(() => {
    if (initialSettings) return;
    let isMounted = true;

    async function loadSettings() {
      try {
        const response = await fetch("/api/upcoming-settings", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as UpcomingSettings;

        if (isMounted && payload?.cinema && payload?.entertainment) {
          setSettings(payload);
        }
      } catch {
        // Keep fallback data in place if the request fails.
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [initialSettings]);

  return settings;
}
