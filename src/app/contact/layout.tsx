import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { buildCollectionPageSchema } from "@/lib/seo";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Contact",
  description:
    "Contact Mainstage for partnerships, creative opportunities, editorial requests, and cultural collaborations.",
  path: "/contact",
  keywords: ["contact", "partnerships", "collaboration", "Mainstage"],
});

export default function ContactLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildCollectionPageSchema({
          name: "Contact",
          description:
            "Contact Mainstage for partnerships, creative opportunities, editorial requests, and cultural collaborations.",
          path: "/contact",
        })}
      />
      {children}
    </>
  );
}
