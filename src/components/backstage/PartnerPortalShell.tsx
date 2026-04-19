"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutClientPortalAction } from "@/app/backstage/login/actions";
import type { BackstagePortalSettings } from "@/lib/backstage-portal";

const NAV_ITEMS = [
  { suffix: "", label: "Overview" },
  { suffix: "/campaigns", label: "Projects" },
  { suffix: "/approvals", label: "Approvals" },
  { suffix: "/files", label: "Deliverables" },
  { suffix: "/reports", label: "Reports" },
  { suffix: "/messages", label: "Messages" },
];

export default function PartnerPortalShell({
  title,
  subtitle,
  shellSettings,
  basePath = "/backstage/portal",
  statusLabel = "Live",
  pendingLabel = "2 approvals",
  children,
}: {
  title: string;
  subtitle: string;
  shellSettings: BackstagePortalSettings["shell"];
  basePath?: string;
  statusLabel?: string;
  pendingLabel?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f5f1ec]">
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col lg:flex-row">
        <aside className="w-full border-b border-black/8 bg-[#111111] px-5 py-6 text-white lg:min-h-screen lg:w-[272px] lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
          <div className="flex items-center justify-between lg:block">
            <Image
              src="/mainstage-logo.png"
              alt="Mainstage"
              width={170}
              height={36}
              className="h-auto w-[170px]"
            />
            <form action={signOutClientPortalAction} className="lg:mt-6">
              <button
                type="submit"
                className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-white/12 px-4 text-[13px] font-body font-medium text-white/78 transition-colors hover:border-white/24 hover:text-white"
              >
                Exit portal
              </button>
            </form>
          </div>

          <div className="mt-8 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5">
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
              {shellSettings.eyebrow}
            </p>
            <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-white">
              {shellSettings.title}
            </h2>
            <p className="mt-3 text-[14px] font-body leading-[1.8] text-white/68">
              {shellSettings.description}
            </p>
          </div>

          <nav className="mt-8 grid gap-1.5">
            {NAV_ITEMS.map((item) => {
              const href = `${basePath}${item.suffix}`;
              const isActive = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    isActive
                      ? "rounded-[14px] bg-[#CE2127] px-4 py-3 text-[15px] font-body font-semibold text-white shadow-[0_14px_30px_rgba(206,33,39,0.28)]"
                      : "rounded-[14px] px-4 py-3 text-[15px] font-body font-medium text-white/72 transition-colors hover:bg-white/6 hover:text-white"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 min-w-0 rounded-[22px] border border-white/10 bg-white/5 p-5">
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-white/46">
              Main contact
            </p>
            <p className="mt-3 break-words text-[16px] font-body font-bold leading-[1.5] text-white [overflow-wrap:anywhere]">
              {shellSettings.contactEmail}
            </p>
            <p className="mt-2 text-[14px] font-body leading-[1.8] text-white/62">
              {shellSettings.contactDescription}
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:px-8 lg:py-8">
          <div className="rounded-[30px] border border-black/8 bg-white px-6 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.06)] md:px-8 md:py-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-[780px]">
                <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                  Partner dashboard
                </p>
                <h1 className="mt-3 text-[36px] font-body font-bold leading-[1.02] tracking-[-0.05em] text-[#181818] md:text-[48px]">
                  {title}
                </h1>
                <p className="mt-4 text-[15px] font-body leading-[1.85] text-black/62">
                  {subtitle}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[320px]">
                <PortalMiniCard label="Status" value={statusLabel} />
                <PortalMiniCard label="Pending" value={pendingLabel} />
              </div>
            </div>

            <div className="mt-8 border-t border-black/6 pt-7">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PortalMiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-black/8 bg-[#faf7f4] px-5 py-4">
      <p className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-black/38">
        {label}
      </p>
      <p className="mt-2 text-[22px] font-body font-bold tracking-[-0.04em] text-[#181818]">
        {value}
      </p>
    </div>
  );
}
