import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { buildCollectionPageSchema } from "@/lib/seo";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Trending Now",
  description:
    "Explore the latest stories published on Mainstage across music, cinema, culture, people, sport, and events.",
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
            "Explore the latest stories published on Mainstage across music, cinema, culture, people, sport, and events.",
          path: "/trending",
        })}
      />
      {children}
    </>
  );
}
