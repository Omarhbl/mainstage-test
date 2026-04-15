import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { buildCollectionPageSchema } from "@/lib/seo";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Sport",
  description:
    "Read Mainstage sport coverage where performance, culture, visibility, and athlete influence meet.",
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
            "Read Mainstage sport coverage where performance, culture, visibility, and athlete influence meet.",
          path: "/sport",
        })}
      />
      {children}
    </>
  );
}
