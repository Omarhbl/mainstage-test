import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { buildCollectionPageSchema } from "@/lib/seo";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Movies Showing in Morocco & Upcoming Releases",
  description:
    "Explore movies now showing in Moroccan cinemas, upcoming film releases, and the latest cinema news, interviews, and festival coverage on Mainstage.",
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
            "Explore movies now showing in Moroccan cinemas, upcoming film releases, and the latest cinema news, interviews, and festival coverage on Mainstage.",
          path: "/cinema",
        })}
      />
      {children}
    </>
  );
}
