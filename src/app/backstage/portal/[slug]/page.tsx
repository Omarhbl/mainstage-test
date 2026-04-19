import PartnerPortalShell from "@/components/backstage/PartnerPortalShell";
import {
  ApprovalRow,
  MetricCard,
  ProjectCard,
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

  const pendingApprovals = backstageSettings.approvals.filter(
    (approval) => approval.status !== "Approved"
  );
  const recentMessages = backstageSettings.messages.slice(0, 4);
  const primaryPoc = projects[0]?.poc ?? backstageSettings.campaigns[0]?.lead ?? "Mainstage";
  const liveProjects = projects.filter((project) => project.status === "Live").length;
  const averageProgress = projects.length
    ? Math.round(
        projects.reduce((total, project) => total + Number(project.progress || 0), 0) /
          projects.length
      )
    : 0;

  return (
    <PartnerPortalShell
      title={backstageSettings.overview.title}
      subtitle={backstageSettings.overview.subtitle}
      shellSettings={backstageSettings.shell}
      basePath={basePath}
      statusLabel={projects.some((project) => project.status === "Live") ? "Live" : "Review"}
      pendingLabel={`${pendingApprovals.length} items`}
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Projects" value={`${projects.length}`} />
          <MetricCard label="POC" value={primaryPoc} />
          <MetricCard label="Pending items" value={`${pendingApprovals.length}`} />
          <MetricCard label="Average progress" value={`${averageProgress}%`} />
        </section>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_14px_34px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                  Project summary
                </p>
                <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                  All live client projects
                </h2>
                <p className="mt-3 max-w-[760px] text-[15px] font-body leading-[1.8] text-black/62">
                  Open any project to view timeline, approvals, financial follow-up, shared files,
                  and the latest conversation with Mainstage.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[18px] border border-black/8 bg-[#fbfaf8] px-5 py-4">
                  <p className="text-[12px] font-body font-semibold uppercase tracking-[0.12em] text-black/42">
                    Live
                  </p>
                  <p className="mt-2 text-[22px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                    {liveProjects}
                  </p>
                </div>
                <div className="rounded-[18px] border border-black/8 bg-[#fbfaf8] px-5 py-4">
                  <p className="text-[12px] font-body font-semibold uppercase tracking-[0.12em] text-black/42">
                    In review
                  </p>
                  <p className="mt-2 text-[22px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                    {projects.filter((project) => project.status === "Review").length}
                  </p>
                </div>
                <div className="rounded-[18px] border border-black/8 bg-[#fbfaf8] px-5 py-4">
                  <p className="text-[12px] font-body font-semibold uppercase tracking-[0.12em] text-black/42">
                    Messages
                  </p>
                  <p className="mt-2 text-[22px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                    {recentMessages.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  pendingCount={
                    backstageSettings.approvals.filter(
                      (approval) =>
                        approval.projectId === project.id &&
                        approval.status !== "Approved"
                    ).length
                  }
                  portalBasePath={basePath}
                />
              ))}
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_14px_34px_rgba(0,0,0,0.04)]">
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                Pending items
              </p>
              <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                Waiting on action
              </h2>
              <div className="mt-5 space-y-3">
                {pendingApprovals.length ? (
                  pendingApprovals.slice(0, 4).map((approval) => (
                    <ApprovalRow key={approval.id} {...approval} />
                  ))
                ) : (
                  <div className="rounded-[18px] border border-black/8 bg-[#fbfaf8] p-4 text-[14px] font-body leading-[1.75] text-black/60">
                    Nothing is pending right now. All current approvals are up to date.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_14px_34px_rgba(0,0,0,0.04)]">
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                Recent updates
              </p>
              <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                Latest conversation
              </h2>
              <div className="mt-5 space-y-3">
                {recentMessages.map((message) => (
                  <div
                    key={message.id}
                    className="rounded-[18px] border border-black/8 bg-[#fbfaf8] p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[18px] font-body font-bold tracking-[-0.03em] text-[#181818]">
                          {message.author}
                        </p>
                        <p className="text-[13px] font-body font-medium text-black/48">
                          {message.role}
                        </p>
                      </div>
                      <p className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-[#CE2127]">
                        {message.date}
                      </p>
                    </div>
                    <p className="mt-3 text-[14px] font-body leading-[1.75] text-black/64">
                      {message.message}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-black/8 bg-[#181818] p-7 text-white shadow-[0_20px_48px_rgba(0,0,0,0.12)]">
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-white/55">
                Follow-up focus
              </p>
              <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-white">
                Stay aligned on what needs approval next
              </h2>
              <p className="mt-3 text-[15px] font-body leading-[1.8] text-white/70">
                The Mainstage team is tracking live progress, approvals, documents, and discussion
                here so your team can review each project without losing context.
              </p>
            </section>
          </div>
        </div>
      </div>
    </PartnerPortalShell>
  );
}
