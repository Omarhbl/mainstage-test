import PartnerPortalShell from "@/components/backstage/PartnerPortalShell";
import { CampaignCard, MetricCard } from "@/components/backstage/PartnerPortalSections";
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
  const campaigns = backstageSettings.campaigns;
  const basePath = `/backstage/portal/${access.client.slug}`;

  return (
    <PartnerPortalShell
      title={backstageSettings.campaignsPage.title}
      subtitle={backstageSettings.campaignsPage.subtitle}
      shellSettings={backstageSettings.shell}
      basePath={basePath}
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Active campaigns" value={`${campaigns.filter((campaign) => campaign.status === "Live").length}`} />
          <MetricCard label="In review" value={`${campaigns.filter((campaign) => campaign.status === "Review").length}`} />
          <MetricCard label="Campaigns listed" value={`${campaigns.length}`} />
          <MetricCard label="Main contact" value={campaigns[0]?.lead ?? "Mainstage"} />
        </section>

        <section className="space-y-5">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              showLink
              portalBasePath={basePath}
            />
          ))}
        </section>
      </div>
    </PartnerPortalShell>
  );
}
