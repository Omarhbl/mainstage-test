import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { buildCollectionPageSchema } from "@/lib/seo";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "People",
  description:
    "A closer look at the personalities, influence, and public figures shaping attention and culture on Mainstage.",
  path: "/people",
  keywords: ["people", "celebrities", "influence", "public figures"],
});

export default function PeopleLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildCollectionPageSchema({
          name: "People",
          description:
            "A closer look at the personalities, influence, and public figures shaping attention and culture on Mainstage.",
          path: "/people",
        })}
      />
      {children}
    </>
  );
}
