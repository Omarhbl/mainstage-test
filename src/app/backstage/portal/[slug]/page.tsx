import Link from "next/link";
import PartnerPortalShell from "@/components/backstage/PartnerPortalShell";
import {
  ApprovalRow,
  FileRow,
  MessageRow,
  MetricCard,
  ReportRow,
} from "@/components/backstage/PartnerPortalSections";
import { requireClientPortalAccess } from "@/lib/supabase/client-portal";
import { getBackstagePortalSettings } from "@/lib/supabase/server";

export default async function BackstageClientPortalOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const access = await requireClientPortalAccess(slug);
  const backstageSettings = await getBackstagePortalSettings(access.client.slug);
  const activeCampaign = backstageSettings.campaigns[0];
  const basePath = `/backstage/portal/${access.client.slug}`;

  return (
    <PartnerPortalShell
      title={backstageSettings.overview.title}
      subtitle={backstageSettings.overview.subtitle}
      shellSettings={backstageSettings.shell}
      basePath={basePath}
    >
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[28px] border border-black/8 bg-[#111111] p-7 text-white shadow-[0_24px_60px_rgba(0,0,0,0.16)]">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-[680px]">
                <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                  Active campaign
                </p>
                <h2 className="mt-3 text-[34px] font-body font-bold leading-[1.02] tracking-[-0.05em] md:text-[40px]">
                  {activeCampaign?.name ?? access.client.companyName}
                </h2>
                <p className="mt-4 max-w-[620px] text-[15px] font-body leading-[1.85] text-white/72">
                  {activeCampaign?.objective ??
                    "Your campaign follow-up, approvals, files, and reports are all centralized here."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:w-[260px] xl:grid-cols-1">
                <div className="rounded-[18px] border border-white/10 bg-white/6 px-5 py-4">
                  <p className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-white/50">
                    Campaign progress
                  </p>
                  <p className="mt-2 text-[28px] font-body font-bold">
                    {activeCampaign?.progress ?? 0}%
                  </p>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-white/6 px-5 py-4">
                  <p className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-white/50">
                    Status
                  </p>
                  <p className="mt-2 text-[24px] font-body font-bold">
                    {activeCampaign?.status ?? "Live"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Budget" value={activeCampaign?.budget ?? "-"} dark />
              <MetricCard label="Lead" value={activeCampaign?.lead ?? "Mainstage"} dark />
              <MetricCard label="Start" value={activeCampaign?.startDate ?? "-"} dark />
              <MetricCard label="End" value={activeCampaign?.endDate ?? "-"} dark />
            </div>
          </section>

          <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_14px_34px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                  Follow-up history
                </p>
                <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                  Recent updates
                </h2>
              </div>
              <Link
                href={`${basePath}/messages`}
                className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#CE2127] px-4 text-[14px] font-body font-semibold text-[#CE2127] transition-colors hover:bg-[#CE2127] hover:text-white"
              >
                Open full conversation
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {backstageSettings.messages.map((message) => (
                <MessageRow key={message.id} {...message} />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_14px_34px_rgba(0,0,0,0.04)]">
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
              Pending approvals
            </p>
            <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
              Items waiting on review
            </h2>
            <div className="mt-5 space-y-3">
              {backstageSettings.approvals.map((approval) => (
                <ApprovalRow key={approval.id} {...approval} />
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_14px_34px_rgba(0,0,0,0.04)]">
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
              Downloads
            </p>
            <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
              Latest deliverables
            </h2>
            <div className="mt-5 space-y-3">
              {backstageSettings.files.slice(0, 3).map((file) => (
                <FileRow key={file.id} {...file} />
              ))}
            </div>
            <Link
              href={`${basePath}/files`}
              className="mt-5 inline-flex h-[44px] items-center justify-center rounded-[12px] border border-black/10 px-4 text-[14px] font-body font-medium text-[#181818] transition-colors hover:bg-[#f3efea]"
            >
              Open full files library
            </Link>
          </section>

          <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_14px_34px_rgba(0,0,0,0.04)]">
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
              Reporting
            </p>
            <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
              Reports and invoices
            </h2>
            <div className="mt-5 space-y-3">
              {backstageSettings.reports.map((report) => (
                <ReportRow key={report.id} {...report} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </PartnerPortalShell>
  );
}
