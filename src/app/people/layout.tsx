import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { buildCollectionPageSchema } from "@/lib/seo";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "People, Interviews & Entertainment News",
  description:
    "Meet the artists, creators, and public figures shaping Morocco and global culture through Mainstage interviews, profiles, and entertainment news.",
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
            "Meet the artists, creators, and public figures shaping Morocco and global culture through Mainstage interviews, profiles, and entertainment news.",
          path: "/people",
        })}
      />
      {children}
    </>
  );
}
