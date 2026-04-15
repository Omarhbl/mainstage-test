import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { buildCollectionPageSchema } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Music",
  description:
    "Follow the releases, artists, charts, and music stories shaping what people are listening to right now on Mainstage.",
  path: "/music",
  keywords: ["music", "Spotify Morocco", "artists", "charts"],
});

export default function MusicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildCollectionPageSchema({
          name: "Music",
          description:
            "Follow the releases, artists, charts, and music stories shaping what people are listening to right now on Mainstage.",
          path: "/music",
        })}
      />
      {children}
    </>
  );
}
