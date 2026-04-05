import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import Ticker from "@/components/layout/Ticker";

const heebo = Heebo({
  subsets: ["latin"],
  variable: "--font-heebo",
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
      className={`${heebo.variable} h-full !scroll-smooth`}
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
