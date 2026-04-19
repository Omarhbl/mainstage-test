import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import SectionCard from "@/components/backoffice/SectionCard";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";

export default async function BackofficeBackstagePage() {
  await requireBackofficeAccess(["admin"]);

  return (
    <div className="space-y-8">
      <BackofficeHeader
        title="Backstage portal"
        subtitle="Manage the client-facing partner portal from one admin-only space. Each card opens a focused editor for that part of the experience."
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard
          title="Clients"
          description="Create partner accounts, remove access, and open each client’s own portal editor."
          href="/backoffice/backstage/clients"
        />
        <SectionCard
          title="Gateway"
          description="Edit the public partner entry page and both call-to-action cards."
          href="/backoffice/backstage/gateway"
        />
        <SectionCard
          title="Login"
          description="Control the login page wording used before a client enters the portal."
          href="/backoffice/backstage/login"
        />
        <SectionCard
          title="Portal shell"
          description="Update the shared portal title, contact block, and sidebar framing."
          href="/backoffice/backstage/shell"
        />
        <SectionCard
          title="Overview"
          description="Manage the overview page headline and the main project summary."
          href="/backoffice/backstage/overview"
        />
        <SectionCard
          title="Projects"
          description="Edit the projects, budgets, and financial entries shown to partners inside the portal."
          href="/backoffice/backstage/campaigns"
        />
        <SectionCard
          title="Approvals"
          description="Update the approval queue and statuses shown to the client."
          href="/backoffice/backstage/approvals"
        />
        <SectionCard
          title="Deliverables"
          description="Manage uploaded file entries and the downloadable library."
          href="/backoffice/backstage/files"
        />
        <SectionCard
          title="Reports"
          description="Edit reports and invoice follow-up blocks inside the portal."
          href="/backoffice/backstage/reports"
        />
        <SectionCard
          title="Messages"
          description="Manage the message feed and follow-up history shown to clients."
          href="/backoffice/backstage/messages"
        />
      </div>
    </div>
  );
}
