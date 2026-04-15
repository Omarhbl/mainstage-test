import PartnerPortalShell from "@/components/backstage/PartnerPortalShell";
import { MetricCard, ReportRow } from "@/components/backstage/PartnerPortalSections";
import { requireClientPortalAccess } from "@/lib/supabase/client-portal";
import { getBackstagePortalSettings } from "@/lib/supabase/server";

export default async function BackstageClientReportsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const access = await requireClientPortalAccess(slug);
  const backstageSettings = await getBackstagePortalSettings(access.client.slug);
  const reports = backstageSettings.reports;
  const invoices = backstageSettings.invoices;
  const basePath = `/backstage/portal/${access.client.slug}`;

  return (
    <PartnerPortalShell
      title={backstageSettings.reportsPage.title}
      subtitle={backstageSettings.reportsPage.subtitle}
      shellSettings={backstageSettings.shell}
      basePath={basePath}
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Reports available" value={`${reports.length}`} />
          <MetricCard label="Invoices issued" value={`${invoices.length}`} />
          <MetricCard label="Latest report" value={reports[0]?.period ?? "-"} />
          <MetricCard label="Finance contact" value="Mainstage Ops" />
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_18px_46px_rgba(0,0,0,0.05)]">
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
              Reporting
            </p>
            <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
              Campaign reports
            </h2>
            <div className="mt-5 space-y-3">
              {reports.map((report) => (
                <ReportRow key={report.id} {...report} />
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_18px_46px_rgba(0,0,0,0.05)]">
            <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
              Invoices
            </p>
            <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
              Finance follow-up
            </h2>
            <div className="mt-5 space-y-3">
              {invoices.map((invoice) => (
                <ReportRow key={invoice.id} {...invoice} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </PartnerPortalShell>
  );
}
