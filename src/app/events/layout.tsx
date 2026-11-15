import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { buildCollectionPageSchema, buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Upcoming Events in Morocco: Concerts, Festivals & Shows",
  description:
    "Discover upcoming concerts, festivals, comedy shows, and cultural events in Morocco. Explore dates, event flyers, and ticket links on Mainstage.",
  path: "/events",
  keywords: ["events", "live shows", "live experiences", "culture"],
});

export default function EventsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildCollectionPageSchema({
          name: "Events",
          description:
            "Discover upcoming concerts, festivals, comedy shows, and cultural events in Morocco. Explore dates, event flyers, and ticket links on Mainstage.",
          path: "/events",
        })}
      />
      {children}
    </>
  );
}
