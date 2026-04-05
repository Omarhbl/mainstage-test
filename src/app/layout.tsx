import type { Metadata } from "next";
import { Bebas_Neue, Syne, DM_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "The Mainstagent | Backstage pass to Moroccan Culture",
  description: "The digital stage for Moroccan Gen Z. Discover the latest in music, film, fashion, and celebrity culture.",
  openGraph: {
    title: "The Mainstagent",
    description: "The digital stage for Moroccan Gen Z.",
    type: "website",
    locale: "en_US",
    siteName: "The Mainstagent",
  },
};

import Ticker from "@/components/layout/Ticker";
import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${syne.variable} ${dmSans.variable} ${cormorant.variable} h-full !scroll-smooth`}
    >
      <body className="bg-void text-text-primary font-body selection:bg-primary/30 flex flex-col min-h-screen">
        <div className="noise-overlay" />
        <Ticker />
        <Navbar />
        <main className="relative z-10 flex-grow">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}
