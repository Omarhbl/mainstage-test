import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { buildCollectionPageSchema } from "@/lib/seo";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Cinema",
  description:
    "Discover Mainstage cinema coverage, upcoming releases, film culture, and the latest movie stories shaping the screen.",
  path: "/cinema",
  keywords: ["cinema", "movies", "upcoming releases", "film"],
});

export default function CinemaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildCollectionPageSchema({
          name: "Cinema",
          description:
            "Discover Mainstage cinema coverage, upcoming releases, film culture, and the latest movie stories shaping the screen.",
          path: "/cinema",
        })}
      />
      {children}
    </>
  );
}
