import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { buildCollectionPageSchema } from "@/lib/seo";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Latest Moroccan Culture & Entertainment News",
  description:
    "Read the latest Mainstage stories on Moroccan music, cinema, events, people, sport, and culture, alongside the international stories that matter.",
  path: "/trending",
  keywords: ["trending", "latest stories", "Morocco"],
});

export default function TrendingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildCollectionPageSchema({
          name: "Trending Now",
          description:
            "Read the latest Mainstage stories on Moroccan music, cinema, events, people, sport, and culture, alongside the international stories that matter.",
          path: "/trending",
        })}
      />
      {children}
    </>
  );
}
