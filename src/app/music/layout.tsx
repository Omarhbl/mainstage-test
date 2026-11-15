import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { buildCollectionPageSchema } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Moroccan Music News, Artists & Charts",
  description:
    "Discover Moroccan music news, new releases, artist interviews, and the latest Spotify and YouTube charts on Mainstage.",
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
            "Discover Moroccan music news, new releases, artist interviews, and the latest Spotify and YouTube charts on Mainstage.",
          path: "/music",
        })}
      />
      {children}
    </>
  );
}
