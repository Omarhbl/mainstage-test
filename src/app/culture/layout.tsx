import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { buildCollectionPageSchema } from "@/lib/seo";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Moroccan Culture, Trends & Creative Stories",
  description:
    "Explore Moroccan culture, creative voices, technology, and the ideas and trends shaping everyday life on Mainstage.",
  path: "/culture",
  keywords: ["culture", "internet culture", "technology", "ideas"],
});

export default function CultureLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildCollectionPageSchema({
          name: "Culture",
          description:
            "Explore Moroccan culture, creative voices, technology, and the ideas and trends shaping everyday life on Mainstage.",
          path: "/culture",
        })}
      />
      {children}
    </>
  );
}
