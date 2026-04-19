import { notFound } from "next/navigation";
import PartnerPortalShell from "@/components/backstage/PartnerPortalShell";
import {
  ApprovalRow,
  BudgetRow,
  FileRow,
  MessageRow,
  MetricCard,
  ReportRow,
} from "@/components/backstage/PartnerPortalSections";
import { sendClientPortalMessageAction } from "@/app/backstage/portal/actions";
import { requireClientPortalAccess } from "@/lib/supabase/client-portal";
import { getBackstagePortalSettings } from "@/lib/supabase/server";

export default async function BackstageClientProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; projectId: string }>;
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { slug, projectId } = await params;
  const { notice, type } = await searchParams;
  const access = await requireClientPortalAccess(slug);
  const backstageSettings = await getBackstagePortalSettings(access.client.slug);
  const basePath = `/backstage/portal/${access.client.slug}`;

  const projects = backstageSettings.projects.length
    ? backstageSettings.projects
    : backstageSettings.campaigns.map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        progress: campaign.progress,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        poc: campaign.lead,
        summary: campaign.objective,
        scope: `${campaign.brand} • ${campaign.budget}`,
      }));

  const project = projects.find((item) => item.id === projectId);

  if (!project) {
    notFound();
  }

  const projectApprovals = backstageSettings.approvals.filter(
    (item) => item.projectId === project.id
  );
  const projectBudgets = backstageSettings.budgetEntries.filter(
    (item) => item.projectId === project.id
  );
  const projectFiles = backstageSettings.files.filter((item) => item.projectId === project.id);
  const projectReports = backstageSettings.reports.filter(
    (item) => item.projectId === project.id
  );
  const projectInvoices = backstageSettings.invoices.filter(
    (item) => item.projectId === project.id
  );
  const projectMessages = backstageSettings.messages.filter(
    (item) => item.projectId === project.id
  );

  return (
    <PartnerPortalShell
      title={project.name}
      subtitle={project.summary}
      shellSettings={backstageSettings.shell}
      basePath={basePath}
      statusLabel={project.status}
      pendingLabel={`${projectApprovals.filter((item) => item.status !== "Approved").length} items`}
    >
      <div className="space-y-6">
        {notice ? (
          <div
            className={`rounded-[16px] border px-4 py-3 text-[14px] font-body leading-[1.7] ${
              type === "success"
                ? "border-[#0f8b4c]/15 bg-[#0f8b4c]/6 text-[#0f8b4c]"
                : "border-[#CE2127]/15 bg-[#CE2127]/6 text-[#9f1b20]"
            }`}
          >
            {notice}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Progress" value={`${project.progress}%`} />
          <MetricCard label="POC" value={project.poc} />
          <MetricCard label="Start" value={project.startDate} />
          <MetricCard label="End" value={project.endDate} />
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_18px_46px_rgba(0,0,0,0.05)]">
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                Project details
              </p>
              <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                Timeline and milestones
              </h2>
              <p className="mt-4 text-[15px] font-body leading-[1.85] text-black/64">
                {project.scope}
              </p>
              <div className="mt-5 rounded-[18px] border border-black/8 bg-[#fbfaf8] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[14px] font-body font-semibold uppercase tracking-[0.12em] text-black/45">
                    Project progress
                  </p>
                  <p className="text-[14px] font-body font-semibold text-[#CE2127]">
                    {project.progress}%
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-black/8">
                  <div
                    className="h-2 rounded-full bg-[#CE2127]"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_18px_46px_rgba(0,0,0,0.05)]">
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                Communication
              </p>
              <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                Project discussion
              </h2>

              <form action={sendClientPortalMessageAction} className="mt-5 space-y-4">
                <input type="hidden" name="client_slug" value={access.client.slug} />
                <input type="hidden" name="project_id" value={project.id} />
                <label className="block">
                  <span className="text-[13px] font-body font-medium text-black/60">
                    Subject
                  </span>
                  <input
                    name="subject"
                    className="mt-2 h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                    placeholder="What needs review or follow-up?"
                  />
                </label>
                <label className="block">
                  <span className="text-[13px] font-body font-medium text-black/60">
                    Message
                  </span>
                  <textarea
                    name="message"
                    rows={5}
                    className="mt-2 w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 py-3 outline-none focus:border-[#CE2127]"
                    placeholder="Write your comment or feedback here..."
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex h-[46px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Send project message
                </button>
              </form>

              <div className="mt-6 space-y-3">
                {projectMessages.length ? (
                  projectMessages.map((message) => (
                    <MessageRow key={message.id} {...message} />
                  ))
                ) : (
                  <div className="rounded-[18px] border border-black/8 bg-[#fbfaf8] p-4 text-[14px] font-body leading-[1.75] text-black/60">
                    No project messages yet. Start the conversation from here.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_18px_46px_rgba(0,0,0,0.05)]">
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                Financials
              </p>
              <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                Budget, quotations, and invoices
              </h2>
              <div className="mt-5 space-y-3">
                {projectBudgets.length ? (
                  projectBudgets.map((entry) => <BudgetRow key={entry.id} {...entry} />)
                ) : (
                  <div className="rounded-[18px] border border-black/8 bg-[#fbfaf8] p-4 text-[14px] font-body leading-[1.75] text-black/60">
                    No financial entries are listed for this project yet.
                  </div>
                )}
              </div>
              <div className="mt-5 space-y-3">
                {projectInvoices.map((invoice) => (
                  <ReportRow key={invoice.id} {...invoice} />
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_18px_46px_rgba(0,0,0,0.05)]">
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                Shared documents
              </p>
              <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                Deliverables and files
              </h2>
              <div className="mt-5 space-y-3">
                {projectFiles.length ? (
                  projectFiles.map((file) => <FileRow key={file.id} {...file} />)
                ) : (
                  <div className="rounded-[18px] border border-black/8 bg-[#fbfaf8] p-4 text-[14px] font-body leading-[1.75] text-black/60">
                    No shared files have been uploaded to this project yet.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_18px_46px_rgba(0,0,0,0.05)]">
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                Progress and review
              </p>
              <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                Approvals and reports
              </h2>
              <div className="mt-5 space-y-3">
                {projectApprovals.map((approval) => (
                  <ApprovalRow key={approval.id} {...approval} />
                ))}
              </div>
              <div className="mt-5 space-y-3">
                {projectReports.map((report) => (
                  <ReportRow key={report.id} {...report} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </PartnerPortalShell>
  );
}
