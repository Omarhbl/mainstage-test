"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PartnerProjectTask } from "@/lib/backstage-portal";
import { requireClientPortalAccess } from "@/lib/supabase/client-portal";
import { createSupabaseAdminClient, getBackstageClients } from "@/lib/supabase/server";

function buildClientPortalRedirect(
  slug: string,
  message: string,
  type: "success" | "error"
) {
  const params = new URLSearchParams({ notice: message, type });
  redirect(`/backstage/portal/${slug}/messages?${params.toString()}`);
}

function buildClientPortalOverviewRedirect(
  slug: string,
  message: string,
  type: "success" | "error"
) {
  const params = new URLSearchParams({ notice: message, type });
  redirect(`/backstage/portal/${slug}?${params.toString()}`);
}

function slugifyPortalValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function formatPortalDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export async function sendClientPortalMessageAction(formData: FormData) {
  const slug = String(formData.get("client_slug") ?? "").trim();
  const access = await requireClientPortalAccess(slug);
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildClientPortalRedirect(
      access.client.slug,
      "The portal could not send your message right now.",
      "error"
    );
  }

  const subject = String(formData.get("subject") ?? "").trim();
  const messageBody = String(formData.get("message") ?? "").trim();
  const projectId = String(formData.get("project_id") ?? "").trim();

  if (!subject || !messageBody) {
    buildClientPortalRedirect(
      access.client.slug,
      "Please add both a subject and a message.",
      "error"
    );
  }

  const clients = await getBackstageClients();
  const targetClient = clients.find((client) => client.slug === access.client.slug);

  if (!targetClient) {
    buildClientPortalRedirect(
      access.client.slug,
      "This client portal could not be found anymore.",
      "error"
    );
  }

  const now = new Date();
  const formattedDate = formatPortalDate(now);
  const nextClients = clients.map((client) => {
    if (client.slug !== access.client.slug) {
      return client;
    }

    return {
      ...client,
      updatedAt: now.toISOString(),
      portalSettings: {
        ...client.portalSettings,
        messages: [
          {
            id: `message-${Date.now()}`,
            projectId: projectId || undefined,
            author: access.fullName || client.contactName || client.companyName,
            role: "Client message",
            date: formattedDate,
            message: `${subject}\n\n${messageBody}`,
          },
          ...client.portalSettings.messages,
        ],
        activityLog: [
          {
            id: `log-${Date.now()}`,
            projectId: projectId || undefined,
            date: formattedDate,
            item: `Client message: ${subject}`,
            note: projectId
              ? "A new project-specific message was sent from the client portal."
              : "A new message was sent from the client portal.",
          },
          ...client.portalSettings.activityLog,
        ],
      },
    };
  });

  const { error } = await adminClient!
    .from("site_settings")
    .update({
      value: nextClients,
      updated_at: now.toISOString(),
    })
    .eq("key", "backstage_clients");

  if (error) {
    buildClientPortalRedirect(
      access.client.slug,
      error.message || "We couldn’t send your message right now.",
      "error"
    );
  }

  revalidatePath(`/backstage/portal/${access.client.slug}`);
  revalidatePath(`/backstage/portal/${access.client.slug}/messages`);
  if (projectId) {
    revalidatePath(`/backstage/portal/${access.client.slug}/projects/${projectId}`);
  }
  revalidatePath("/backoffice/backstage/clients");
  buildClientPortalRedirect(access.client.slug, "Your message was sent.", "success");
}

export async function createClientPortalProjectAction(formData: FormData) {
  const slug = String(formData.get("client_slug") ?? "").trim();
  const access = await requireClientPortalAccess(slug);
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildClientPortalOverviewRedirect(
      access.client.slug,
      "The portal could not submit this project right now.",
      "error"
    );
  }

  const projectName = String(formData.get("project_name") ?? "").trim();
  const summary = String(formData.get("project_summary") ?? "").trim();
  const scope = String(formData.get("project_scope") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim();
  const budget = String(formData.get("budget") ?? "").trim();
  const rawNeeds = String(formData.get("project_needs") ?? "").trim();

  if (!projectName || !summary) {
    buildClientPortalOverviewRedirect(
      access.client.slug,
      "Please add at least a project name and a short summary.",
      "error"
    );
  }

  const clients = await getBackstageClients();
  const targetClient = clients.find((client) => client.slug === access.client.slug);

  if (!targetClient) {
    buildClientPortalOverviewRedirect(
      access.client.slug,
      "This client portal could not be found anymore.",
      "error"
    );
  }

  const now = new Date();
  const formattedDate = formatPortalDate(now);
  const projectId = `${slugifyPortalValue(projectName) || "project"}-${Date.now()}`;
  const tasks: PartnerProjectTask[] = rawNeeds
    ? rawNeeds
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((title, index) => ({
          id: `${projectId}-task-${index + 1}`,
          title,
          status: "Pending review",
        }))
    : [];

  const nextClients = clients.map((client) => {
    if (client.slug !== access.client.slug) {
      return client;
    }

    const submittedBy = access.fullName || client.contactName || client.companyName;
    const poc =
      client.portalSettings.projects[0]?.poc ||
      client.portalSettings.campaigns[0]?.lead ||
      "Mainstage team";

    return {
      ...client,
      updatedAt: now.toISOString(),
      portalSettings: {
        ...client.portalSettings,
        projects: [
          {
            id: projectId,
            name: projectName,
            status: "Pending review",
            progress: 0,
            startDate: startDate || "To confirm",
            endDate: endDate || "To confirm",
            poc,
            summary,
            scope: scope || "Scope to be validated with Mainstage.",
            tasks,
          },
          ...client.portalSettings.projects,
        ],
        budgetEntries: budget
          ? [
              {
                id: `budget-${projectId}`,
                projectId,
                label: "Proposed project budget",
                type: "Budget",
                amount: budget.toUpperCase().includes("MAD") ? budget : `${budget} MAD`,
                status: "Pending review",
                submittedBy,
                updatedAt: formattedDate,
              },
              ...client.portalSettings.budgetEntries,
            ]
          : client.portalSettings.budgetEntries,
        approvals: [
          {
            id: `approval-${projectId}`,
            projectId,
            title: `Validate ${projectName}`,
            type: "Project request",
            dueDate: formattedDate,
            status: "Waiting",
            assignee: "Mainstage team",
          },
          ...client.portalSettings.approvals,
        ],
        messages: [
          {
            id: `message-${projectId}`,
            projectId,
            author: submittedBy,
            role: "Client request",
            date: formattedDate,
            message: `New project request submitted.\n\n${summary}`,
          },
          ...client.portalSettings.messages,
        ],
        activityLog: [
          {
            id: `log-${projectId}`,
            projectId,
            date: formattedDate,
            item: `Project request submitted: ${projectName}`,
            note: "Mainstage needs to validate the project timeline, budget, and requested elements.",
          },
          ...client.portalSettings.activityLog,
        ],
      },
    };
  });

  const { error } = await adminClient!
    .from("site_settings")
    .update({
      value: nextClients,
      updated_at: now.toISOString(),
    })
    .eq("key", "backstage_clients");

  if (error) {
    buildClientPortalOverviewRedirect(
      access.client.slug,
      error.message || "We couldn’t submit this project right now.",
      "error"
    );
  }

  revalidatePath(`/backstage/portal/${access.client.slug}`);
  revalidatePath(`/backstage/portal/${access.client.slug}/campaigns`);
  revalidatePath(`/backstage/portal/${access.client.slug}/projects/${projectId}`);
  revalidatePath(`/backstage/portal/${access.client.slug}/approvals`);
  revalidatePath(`/backstage/portal/${access.client.slug}/messages`);
  revalidatePath(`/backoffice/backstage/clients/${access.client.slug}`);
  revalidatePath("/backoffice/backstage/clients");

  buildClientPortalOverviewRedirect(
    access.client.slug,
    "Project request sent to Mainstage for validation.",
    "success"
  );
}
