import PartnerPortalShell from "@/components/backstage/PartnerPortalShell";
import { FileRow, MetricCard } from "@/components/backstage/PartnerPortalSections";
import { requireClientPortalAccess } from "@/lib/supabase/client-portal";
import { getBackstagePortalSettings } from "@/lib/supabase/server";

export default async function BackstageClientFilesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const access = await requireClientPortalAccess(slug);
  const backstageSettings = await getBackstagePortalSettings(access.client.slug);
  const files = backstageSettings.files;
  const basePath = `/backstage/portal/${access.client.slug}`;

  return (
    <PartnerPortalShell
      title={backstageSettings.filesPage.title}
      subtitle={backstageSettings.filesPage.subtitle}
      shellSettings={backstageSettings.shell}
      basePath={basePath}
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Uploaded deliverables" value={`${files.length}`} />
          <MetricCard label="Creative files" value={`${files.filter((file) => file.category.toLowerCase().includes("creative")).length}`} />
          <MetricCard label="Reports" value={`${files.filter((file) => file.category.toLowerCase().includes("report")).length}`} />
          <MetricCard label="Last upload" value={files[0]?.updatedAt ?? "-"} />
        </section>

        <section className="rounded-[24px] border border-black/8 bg-white p-7 shadow-[0_18px_46px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            File library
          </p>
          <h2 className="mt-2 text-[30px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Uploaded deliverables
          </h2>
          <div className="mt-5 space-y-3">
            {files.map((file) => (
              <FileRow key={file.id} {...file} />
            ))}
          </div>
        </section>
      </div>
    </PartnerPortalShell>
  );
}
