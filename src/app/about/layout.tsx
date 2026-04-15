import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { buildCollectionPageSchema } from "@/lib/seo";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "About Us",
  description:
    "Learn what Mainstage covers, how the platform thinks about culture, and the stories, industries, and people it spotlights.",
  path: "/about",
  keywords: ["about", "Mainstage", "culture platform"],
});

export default function AboutLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildCollectionPageSchema({
          name: "About Us",
          description:
            "Learn what Mainstage covers, how the platform thinks about culture, and the stories, industries, and people it spotlights.",
          path: "/about",
        })}
      />
      {children}
    </>
  );
}
