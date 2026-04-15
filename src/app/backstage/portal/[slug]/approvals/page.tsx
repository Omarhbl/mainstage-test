import PartnerPortalShell from "@/components/backstage/PartnerPortalShell";
import { ApprovalRow, MetricCard } from "@/components/backstage/PartnerPortalSections";
import { requireClientPortalAccess } from "@/lib/supabase/client-portal";
import { getBackstagePortalSettings } from "@/lib/supabase/server";

export default async function BackstageClientApprovalsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const access = await requireClientPortalAccess(slug);
  const backstageSettings = await getBackstagePortalSettings(access.client.slug);
  const approvals = backstageSettings.approvals;
  const basePath = `/backstage/portal/${access.client.slug}`;

  return (
    <PartnerPortalShell
      title={backstageSettings.approvalsPage.title}
      subtitle={backstageSettings.approvalsPage.subtitle}
      shellSettings={backstageSettings.shell}
      basePath={basePath}
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Pending approvals" value={`${approvals.filter((item) => item.status === "Waiting").length}`} />
          <MetricCard label="Needs changes" value={`${approvals.filter((item) => item.status === "Needs changes").length}`} />
          <MetricCard label="Approved" value={`${approvals.filter((item) => item.status === "Approved").length}`} />
        </section>

        <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_18px_46px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Review queue
          </p>
          <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Pending approvals
          </h2>
          <div className="mt-5 space-y-3">
            {approvals.map((approval) => (
              <ApprovalRow key={approval.id} {...approval} />
            ))}
          </div>
        </section>
      </div>
    </PartnerPortalShell>
  );
}
