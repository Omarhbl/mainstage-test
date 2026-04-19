import Link from "next/link";
import { notFound } from "next/navigation";
import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import SectionCard from "@/components/backoffice/SectionCard";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { getBackstageClientBySlug, getBackstagePortalSettings } from "@/lib/supabase/server";

export default async function BackofficeBackstageClientPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireBackofficeAccess(["admin"]);
  const { slug } = await params;
  const client = await getBackstageClientBySlug(slug);
  const settings = client ? await getBackstagePortalSettings(client.slug) : null;

  if (!client || !settings) {
    notFound();
  }

  const initials = client.companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="space-y-8">
      <BackofficeHeader
        title={`${client.companyName} portal`}
        subtitle={`Manage ${client.companyName}'s portal by project. Start with the overview, then open each project card to update what the client sees.`}
      />

      <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-black/8 bg-[#faf8f6]">
              {client.logoUrl ? (
                <img
                  src={client.logoUrl}
                  alt={`${client.companyName} logo`}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <span className="text-[22px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                  {initials || "CL"}
                </span>
              )}
            </div>

            <div>
              <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                Client profile
              </p>
              <h2 className="mt-2 text-[28px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                {client.companyName}
              </h2>
              <p className="mt-2 text-[15px] font-body leading-[1.8] text-black/62">
                {client.contactName} • {client.email}
              </p>
              <p className="mt-1 text-[13px] font-body text-black/48">
                Portal URL: /backstage/portal/{client.slug}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/backoffice/backstage/clients"
              className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-black/10 px-4 text-[14px] font-body font-medium text-[#181818] transition-colors hover:bg-[#f3efea]"
            >
              Back to clients
            </Link>
            <Link
              href={`/backstage/portal/${client.slug}`}
              className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#CE2127] px-4 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
            >
              Open client portal
            </Link>
          </div>
        </div>
      </div>

      <section className="space-y-5">
        <div>
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Portal structure
          </p>
          <h2 className="mt-2 text-[28px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Start with the portal overview
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <SectionCard
            title="Overview"
            description="Edit the top-level page title, summary, and overall presentation for this client portal."
            href={`/backoffice/backstage/overview?client=${client.slug}`}
          />
          <SectionCard
            title="Projects page"
            description="Control the project list intro and manage all project cards, budgets, quotations, and invoices for this client."
            href={`/backoffice/backstage/campaigns?client=${client.slug}`}
          />
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Projects
          </p>
          <h2 className="mt-2 text-[28px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            One card per project
          </h2>
          <p className="mt-2 max-w-[780px] text-[15px] font-body leading-[1.8] text-black/62">
            These cards reflect the projects currently configured for {client.companyName}. Open
            the projects editor to update scope, progress, budgets, approvals, files, reports, and
            client-facing messages for each one.
          </p>
        </div>

        {settings.projects.length ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {settings.projects.map((project) => {
              const pendingItems = settings.approvals.filter(
                (approval) =>
                  approval.projectId === project.id && approval.status !== "Approved"
              ).length;

              return (
                <Link
                  key={project.id}
                  href={`/backoffice/backstage/campaigns?client=${client.slug}&focus_project=${project.id}`}
                  className="group rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
                >
                  <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
                    {project.status}
                  </p>
                  <h3 className="mt-2 text-[26px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                    {project.name}
                  </h3>
                  <p className="mt-3 text-[15px] font-body leading-[1.8] text-black/62">
                    {project.summary}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-[16px] border border-black/8 bg-[#faf8f6] px-4 py-3">
                      <p className="text-[12px] font-body font-semibold uppercase tracking-[0.12em] text-black/42">
                        Progress
                      </p>
                      <p className="mt-2 text-[22px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                        {project.progress}%
                      </p>
                    </div>
                    <div className="rounded-[16px] border border-black/8 bg-[#faf8f6] px-4 py-3">
                      <p className="text-[12px] font-body font-semibold uppercase tracking-[0.12em] text-black/42">
                        Pending
                      </p>
                      <p className="mt-2 text-[22px] font-body font-bold tracking-[-0.04em] text-[#181818]">
                        {pendingItems}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-[14px] font-body text-black/52">
                    {project.startDate} → {project.endDate}
                  </p>
                  <span className="mt-4 inline-flex items-center text-[14px] font-body font-semibold text-[#CE2127] transition-transform group-hover:translate-x-1">
                    Open project editor
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[20px] border border-black/8 bg-white p-6 text-[15px] font-body leading-[1.8] text-black/62 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
            No project is configured yet for this client. Use the{" "}
            <Link
              href={`/backoffice/backstage/campaigns?client=${client.slug}`}
              className="font-semibold text-[#CE2127]"
            >
              Projects page
            </Link>{" "}
            to add the first one.
          </div>
        )}
      </section>
    </div>
  );
}
