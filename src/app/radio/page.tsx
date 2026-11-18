import type { Metadata } from "next";
import { RadioPagePlayer } from "@/components/radio/RadioPlayer";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "On Air — Mainstage Radio",
  description: "Listen to Mainstage Radio live, 24/7. See what’s playing and discover the tracks you just missed.",
  alternates: { canonical: "/radio" },
};
export default function RadioPage() {
  return <><RadioPagePlayer /><SiteFooter /></>;
}
