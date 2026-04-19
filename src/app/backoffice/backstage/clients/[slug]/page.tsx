import Link from "next/link";
import { notFound } from "next/navigation";
import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import SectionCard from "@/components/backoffice/SectionCard";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { getBackstageClientBySlug } from "@/lib/supabase/server";

const CLIENT_SECTIONS = [
  { title: "Gateway", href: "gateway", description: "Edit this client’s public entry page." },
  { title: "Login", href: "login", description: "Adjust the wording for this client’s login screen." },
  { title: "Portal shell", href: "shell", description: "Update the portal framing, labels, and contact block." },
  { title: "Overview", href: "overview", description: "Manage the overview page headline and summary." },
  { title: "Projects", href: "campaigns", description: "Edit the projects, budgets, and financial items this client sees inside the portal." },
  { title: "Approvals", href: "approvals", description: "Manage approval queue items for this client." },
  { title: "Deliverables", href: "files", description: "Control downloadable assets and deliverables." },
  { title: "Reports", href: "reports", description: "Edit reports and invoice tracking for this client." },
  { title: "Messages", href: "messages", description: "Manage notes, messages, and follow-up history." },
] as const;

export default async function BackofficeBackstageClientPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireBackofficeAccess(["admin"]);
  const { slug } = await params;
  const client = await getBackstageClientBySlug(slug);

  if (!client) {
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
        subtitle={`Manage ${client.companyName}'s client experience, credentials, and portal content from this one place.`}
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

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {CLIENT_SECTIONS.map((section) => (
          <SectionCard
            key={section.href}
            title={section.title}
            description={section.description}
            href={`/backoffice/backstage/${section.href}?client=${client.slug}`}
          />
        ))}
      </div>
    </div>
  );
}
