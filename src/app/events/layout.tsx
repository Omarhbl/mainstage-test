import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { buildCollectionPageSchema, buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Events",
  description:
    "See upcoming events, live moments, and the stories shaping how audiences experience culture.",
  path: "/events",
  keywords: ["events", "live shows", "live experiences", "culture"],
});

export default function EventsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildCollectionPageSchema({
          name: "Events",
          description:
            "See upcoming events, live moments, and the stories shaping how audiences experience culture.",
          path: "/events",
        })}
      />
      {children}
    </>
  );
}
