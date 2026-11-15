import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { buildCollectionPageSchema } from "@/lib/seo";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Sport News, Athletes & Moroccan Sporting Culture",
  description:
    "Explore Moroccan sport, athlete stories, football, and the connections between sport and culture on Mainstage.",
  path: "/sport",
  keywords: ["sport", "athletes", "football", "culture"],
});

export default function SportLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildCollectionPageSchema({
          name: "Sport",
          description:
            "Explore Moroccan sport, athlete stories, football, and the connections between sport and culture on Mainstage.",
          path: "/sport",
        })}
      />
      {children}
    </>
  );
}
