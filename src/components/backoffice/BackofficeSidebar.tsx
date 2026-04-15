"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/backoffice/actions";
import type { BackofficeRole } from "@/lib/supabase/backoffice";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/backoffice", roles: ["admin", "editor"] as BackofficeRole[] },
  { label: "Articles", href: "/backoffice/articles", roles: ["admin", "editor"] as BackofficeRole[] },
  { label: "Homepage", href: "/backoffice/homepage", roles: ["admin", "editor"] as BackofficeRole[] },
  { label: "Upcoming", href: "/backoffice/upcoming", roles: ["admin", "editor"] as BackofficeRole[] },
  { label: "Media", href: "/backoffice/media", roles: ["admin", "editor"] as BackofficeRole[] },
  { label: "Feeds", href: "/backoffice/feeds", roles: ["admin", "editor"] as BackofficeRole[] },
  { label: "Team", href: "/backoffice/team", roles: ["admin"] as BackofficeRole[] },
  { label: "Backstage", href: "/backoffice/backstage", roles: ["admin"] as BackofficeRole[] },
  { label: "Settings", href: "/backoffice/settings", roles: ["admin"] as BackofficeRole[] },
];

export default function BackofficeSidebar({
  role,
  fullName,
}: {
  role: BackofficeRole;
  fullName: string;
}) {
  const pathname = usePathname();
  const isCompact = pathname === "/login";
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col border-r border-white/10 bg-[#111111] text-white",
        isCompact ? "px-0 py-0" : "px-5 py-6 lg:w-[260px]"
      )}
    >
      <Link href="/" className="w-fit">
        <Image
          src="/mainstage-logo.png"
          alt="Mainstage"
          width={150}
          height={32}
          className="h-auto w-[150px]"
        />
      </Link>

      <div className="mt-8">
        <p className="text-[11px] font-body font-semibold uppercase tracking-[0.18em] text-white/45">
          Back Office
        </p>
        <p className="mt-2 text-[14px] font-body font-normal text-white/75">
          Editorial workspace for the team
        </p>
      </div>

      <nav className="mt-8 space-y-2">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-[10px] px-4 py-3 text-[15px] font-body transition-colors",
                isActive
                  ? "bg-[#CE2127] font-semibold text-white"
                  : "text-white/75 hover:bg-white/6 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="rounded-[14px] border border-white/10 bg-white/5 p-4">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.12em] text-white/55">
            Team space
          </p>
          <p className="mt-2 text-[15px] font-body font-medium text-white">
            {fullName}
          </p>
          <p className="mt-1 text-[13px] font-body font-normal leading-[1.6] text-white/65">
            Signed in as {role}. Use this space to manage stories, homepage highlights,
            media, and the daily editorial flow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-[42px] flex-1 items-center justify-center rounded-[12px] border border-white/12 bg-white/5 px-4 text-[13px] font-body font-medium text-white transition-colors hover:bg-white/10"
          >
            View website
          </Link>
          {isCompact ? (
            <Link
              href="/login"
              className="inline-flex h-[42px] items-center justify-center rounded-[12px] bg-[#CE2127] px-4 text-[13px] font-body font-semibold text-white transition-opacity hover:opacity-90"
            >
              Login
            </Link>
          ) : (
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex h-[42px] items-center justify-center rounded-[12px] bg-[#CE2127] px-4 text-[13px] font-body font-semibold text-white transition-opacity hover:opacity-90"
              >
                Sign out
              </button>
            </form>
          )}
        </div>
      </div>
    </aside>
  );
}
