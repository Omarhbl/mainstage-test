import type { Metadata } from "next";
import GuestlistLanding from "@/components/guestlist/GuestlistLanding";
import JsonLd from "@/components/seo/JsonLd";
import { buildSeoDescription, toAbsoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Guestlist",
  description: buildSeoDescription(
    "Join the Mainstage guestlist and get direct access to what is moving behind the scenes."
  ),
  alternates: {
    canonical: "/guestlist",
  },
  openGraph: {
    title: "Mainstage Guestlist",
    description: buildSeoDescription(
      "Join the Mainstage guestlist and get direct access to what is moving behind the scenes."
    ),
    url: "/guestlist",
  },
};

export default function GuestlistPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Mainstage Guestlist",
    url: toAbsoluteUrl("/guestlist"),
    description: buildSeoDescription(
      "Join the Mainstage guestlist and get direct access to what is moving behind the scenes."
    ),
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <GuestlistLanding />
    </>
  );
}
