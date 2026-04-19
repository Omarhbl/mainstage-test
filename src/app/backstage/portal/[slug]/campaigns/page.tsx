import PartnerPortalShell from "@/components/backstage/PartnerPortalShell";
import { MetricCard, ProjectCard } from "@/components/backstage/PartnerPortalSections";
import { requireClientPortalAccess } from "@/lib/supabase/client-portal";
import { getBackstagePortalSettings } from "@/lib/supabase/server";

export default async function BackstageClientCampaignsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const access = await requireClientPortalAccess(slug);
  const backstageSettings = await getBackstagePortalSettings(access.client.slug);
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
  const basePath = `/backstage/portal/${access.client.slug}`;

  return (
    <PartnerPortalShell
      title={backstageSettings.projectsPage.title}
      subtitle={backstageSettings.projectsPage.subtitle}
      shellSettings={backstageSettings.shell}
      basePath={basePath}
      statusLabel={projects.some((project) => project.status === "Live") ? "Live" : "Review"}
      pendingLabel={`${backstageSettings.approvals.filter((item) => item.status !== "Approved").length} items`}
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Active projects" value={`${projects.filter((item) => item.status === "Live").length}`} />
          <MetricCard label="In review" value={`${projects.filter((item) => item.status === "Review").length}`} />
          <MetricCard label="Projects listed" value={`${projects.length}`} />
          <MetricCard label="Main contact" value={projects[0]?.poc ?? "Mainstage"} />
        </section>

        <section className="space-y-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              pendingCount={
                backstageSettings.approvals.filter(
                  (approval) =>
                    approval.projectId === project.id && approval.status !== "Approved"
                ).length
              }
              portalBasePath={basePath}
            />
          ))}
        </section>
      </div>
    </PartnerPortalShell>
  );
}
