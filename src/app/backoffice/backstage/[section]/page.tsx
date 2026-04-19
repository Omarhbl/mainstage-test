import { notFound } from "next/navigation";
import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import BackstageSectionEditor from "@/components/backoffice/BackstageSectionEditor";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { getBackstageClientBySlug, getBackstagePortalSettings } from "@/lib/supabase/server";

const BACKSTAGE_SECTIONS = {
  gateway: {
    title: "Gateway",
    subtitle: "Edit the public entry page that introduces the partner backstage.",
  },
  login: {
    title: "Login",
    subtitle: "Update the client login page wording before a partner enters the portal.",
  },
  shell: {
    title: "Portal shell",
    subtitle: "Control the shared title, contact block, and framing used across the portal.",
  },
  overview: {
    title: "Overview",
    subtitle: "Manage the top-level overview page content and intro wording.",
  },
  campaigns: {
    title: "Projects",
    subtitle: "Manage the client projects, budget lines, and project page text shown in the portal.",
  },
  approvals: {
    title: "Approvals",
    subtitle: "Manage the approval queue and its statuses.",
  },
  files: {
    title: "Deliverables",
    subtitle: "Update downloadable files and the deliverables library.",
  },
  reports: {
    title: "Reports",
    subtitle: "Edit reporting cards and invoice follow-up blocks.",
  },
  messages: {
    title: "Messages",
    subtitle: "Manage the message feed and follow-up history seen by the client.",
  },
} as const;

type BackstageSectionKey = keyof typeof BACKSTAGE_SECTIONS;

export default async function BackofficeBackstageSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ notice?: string; type?: string; client?: string }>;
}) {
  await requireBackofficeAccess(["admin"]);
  const { section } = await params;
  const { notice, type, client } = await searchParams;

  if (!(section in BACKSTAGE_SECTIONS)) {
    notFound();
  }

  const sectionKey = section as BackstageSectionKey;
  const config = BACKSTAGE_SECTIONS[sectionKey];
  const clientSlug = typeof client === "string" && client.trim() ? client.trim() : "";
  const clientRecord = clientSlug ? await getBackstageClientBySlug(clientSlug) : null;

  if (clientSlug && !clientRecord) {
    notFound();
  }

  const settings = await getBackstagePortalSettings(clientSlug || undefined);

  return (
    <div className="space-y-8">
      <BackofficeHeader
        title={config.title}
        subtitle={
          clientRecord
            ? `${config.subtitle} You are editing ${clientRecord.companyName}'s portal.`
            : config.subtitle
        }
      />

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

      <BackstageSectionEditor
        section={sectionKey}
        settings={settings}
        clientSlug={clientRecord?.slug}
        clientName={clientRecord?.companyName}
      />
    </div>
  );
}
