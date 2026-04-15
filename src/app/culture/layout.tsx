import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { buildCollectionPageSchema } from "@/lib/seo";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Culture",
  description:
    "Track the ideas, shifts, internet moments, and everyday signals changing culture right now on Mainstage.",
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
            "Track the ideas, shifts, internet moments, and everyday signals changing culture right now on Mainstage.",
          path: "/culture",
        })}
      />
      {children}
    </>
  );
}
