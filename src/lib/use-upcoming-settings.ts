"use client";

import { useEffect, useState } from "react";
import {
  FALLBACK_ENTERTAINMENT_UPCOMING,
  UPCOMING_RELEASES,
  type UpcomingSettings,
} from "@/lib/upcoming";

const fallbackSettings: UpcomingSettings = {
  cinema: UPCOMING_RELEASES.slice(0, 8),
  entertainment: FALLBACK_ENTERTAINMENT_UPCOMING.slice(0, 8),
};

export function useUpcomingSettings() {
  const [settings, setSettings] = useState<UpcomingSettings>(fallbackSettings);

  useEffect(() => {
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
  }, []);

  return settings;
}
