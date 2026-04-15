"use client";

import { usePathname } from "next/navigation";
import FeedAutoRefreshHeartbeat from "@/components/layout/FeedAutoRefreshHeartbeat";
import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";
import Ticker from "@/components/layout/Ticker";

type TickerItem = {
  title: string;
  href: string;
};

export default function AppChrome({
  children,
  tickerItems,
}: {
  children: React.ReactNode;
  tickerItems: TickerItem[];
}) {
  const pathname = usePathname();
  const isBackofficeRoute =
    pathname === "/login" ||
    pathname.startsWith("/backoffice") ||
    pathname.startsWith("/backstage");

  if (isBackofficeRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <FeedAutoRefreshHeartbeat />
      <Ticker items={tickerItems} />
      <Navbar />
      <main className="relative z-10 flex-grow">{children}</main>
      <MobileNav />
    </>
  );
}
