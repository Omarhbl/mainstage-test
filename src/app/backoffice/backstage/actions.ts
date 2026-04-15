"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import {
  createSupabaseAdminClient,
  getBackstageClients,
  getBackstagePortalSettings,
} from "@/lib/supabase/server";

function buildBackstageRedirect(
  message: string,
  type: "success" | "error",
  redirectTarget?: string
) {
  const extraParams = new URLSearchParams({ notice: message, type });

  if (redirectTarget && redirectTarget.startsWith("backstage:")) {
    const rawTarget = redirectTarget.replace("backstage:", "");
    const [pathname, queryString = ""] = rawTarget.split("?");
    const mergedParams = new URLSearchParams(queryString);

    extraParams.forEach((value, key) => {
      mergedParams.set(key, value);
    });

    redirect(`/backoffice/backstage/${pathname}?${mergedParams.toString()}`);
  }

  redirect(`/backoffice/backstage?${extraParams.toString()}`);
}

export async function updateBackstagePortalSettingsAction(formData: FormData) {
  await requireBackofficeAccess(["admin"]);

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildBackstageRedirect("Missing service role key in .env.local.", "error");
  }

  const currentSettings = await getBackstagePortalSettings();
  const section = String(formData.get("section") ?? "").trim();
  const redirectTarget = String(formData.get("redirect_target") ?? "").trim();
  const clientSlug = String(formData.get("client_slug") ?? "").trim();
  const currentClients = clientSlug ? await getBackstageClients() : [];
  const baseSettings = clientSlug
    ? await getBackstagePortalSettings(clientSlug)
    : currentSettings;
  const messageCount = Math.max(
    0,
    Number.parseInt(String(formData.get("message_count") ?? "0"), 10) || 0
  );
  const activityCount = Math.max(
    0,
    Number.parseInt(String(formData.get("activity_count") ?? "0"), 10) || 0
  );

  const nextSettings = {
    ...baseSettings,
    gateway:
      section === "gateway"
        ? {
            eyebrow: String(formData.get("gateway_eyebrow") ?? "").trim(),
            title: String(formData.get("gateway_title") ?? "").trim(),
            subtitle: String(formData.get("gateway_subtitle") ?? "").trim(),
            existingEyebrow: String(formData.get("gateway_existing_eyebrow") ?? "").trim(),
            existingTitle: String(formData.get("gateway_existing_title") ?? "").trim(),
            existingDescription: String(
              formData.get("gateway_existing_description") ?? ""
            ).trim(),
            existingCtaLabel: String(
              formData.get("gateway_existing_cta_label") ?? ""
            ).trim(),
            joinEyebrow: String(formData.get("gateway_join_eyebrow") ?? "").trim(),
            joinTitle: String(formData.get("gateway_join_title") ?? "").trim(),
            joinDescription: String(formData.get("gateway_join_description") ?? "").trim(),
            joinCtaLabel: String(formData.get("gateway_join_cta_label") ?? "").trim(),
          }
        : baseSettings.gateway,
    login:
      section === "login"
        ? {
            eyebrow: String(formData.get("login_eyebrow") ?? "").trim(),
            title: String(formData.get("login_title") ?? "").trim(),
            subtitle: String(formData.get("login_subtitle") ?? "").trim(),
            submitLabel: String(formData.get("login_submit_label") ?? "").trim(),
            backLabel: String(formData.get("login_back_label") ?? "").trim(),
            contactLabel: String(formData.get("login_contact_label") ?? "").trim(),
          }
        : baseSettings.login,
    shell:
      section === "shell"
        ? {
            eyebrow: String(formData.get("shell_eyebrow") ?? "").trim(),
            title: String(formData.get("shell_title") ?? "").trim(),
            description: String(formData.get("shell_description") ?? "").trim(),
            contactEmail: String(formData.get("shell_contact_email") ?? "").trim(),
            contactDescription: String(
              formData.get("shell_contact_description") ?? ""
            ).trim(),
          }
        : baseSettings.shell,
    overview:
      section === "overview"
        ? {
            title: String(formData.get("overview_title") ?? "").trim(),
            subtitle: String(formData.get("overview_subtitle") ?? "").trim(),
          }
        : baseSettings.overview,
    campaignsPage:
      section === "campaigns"
        ? {
            title: String(formData.get("campaigns_page_title") ?? "").trim(),
            subtitle: String(formData.get("campaigns_page_subtitle") ?? "").trim(),
          }
        : baseSettings.campaignsPage,
    approvalsPage:
      section === "approvals"
        ? {
            title: String(formData.get("approvals_page_title") ?? "").trim(),
            subtitle: String(formData.get("approvals_page_subtitle") ?? "").trim(),
          }
        : baseSettings.approvalsPage,
    filesPage:
      section === "files"
        ? {
            title: String(formData.get("files_page_title") ?? "").trim(),
            subtitle: String(formData.get("files_page_subtitle") ?? "").trim(),
          }
        : baseSettings.filesPage,
    reportsPage:
      section === "reports"
        ? {
            title: String(formData.get("reports_page_title") ?? "").trim(),
            subtitle: String(formData.get("reports_page_subtitle") ?? "").trim(),
          }
        : baseSettings.reportsPage,
    messagesPage:
      section === "messages"
        ? {
            title: String(formData.get("messages_page_title") ?? "").trim(),
            subtitle: String(formData.get("messages_page_subtitle") ?? "").trim(),
          }
        : baseSettings.messagesPage,
    campaigns:
      section === "campaigns"
        ? Array.from({ length: 4 }, (_, index) => ({
            id: `cmp-${index + 1}`,
            name: String(formData.get(`campaign_name_${index + 1}`) ?? "").trim(),
            brand: String(formData.get(`campaign_brand_${index + 1}`) ?? "").trim(),
            status: String(formData.get(`campaign_status_${index + 1}`) ?? "").trim() as
              | "Live"
              | "Review"
              | "Scheduled",
            startDate: String(formData.get(`campaign_start_date_${index + 1}`) ?? "").trim(),
            endDate: String(formData.get(`campaign_end_date_${index + 1}`) ?? "").trim(),
            progress: Number.parseInt(
              String(formData.get(`campaign_progress_${index + 1}`) ?? "0"),
              10
            ) || 0,
            budget: String(formData.get(`campaign_budget_${index + 1}`) ?? "").trim(),
            lead: String(formData.get(`campaign_lead_${index + 1}`) ?? "").trim(),
            objective: String(formData.get(`campaign_objective_${index + 1}`) ?? "").trim(),
          })).filter((item) => item.name && item.brand)
        : baseSettings.campaigns,
    approvals:
      section === "approvals"
        ? Array.from({ length: 5 }, (_, index) => ({
            id: `apr-${index + 1}`,
            title: String(formData.get(`approval_title_${index + 1}`) ?? "").trim(),
            type: String(formData.get(`approval_type_${index + 1}`) ?? "").trim(),
            dueDate: String(formData.get(`approval_due_date_${index + 1}`) ?? "").trim(),
            status: String(formData.get(`approval_status_${index + 1}`) ?? "").trim() as
              | "Waiting"
              | "Approved"
              | "Needs changes",
            assignee: String(formData.get(`approval_assignee_${index + 1}`) ?? "").trim(),
          })).filter((item) => item.title && item.type)
        : baseSettings.approvals,
    files:
      section === "files"
        ? Array.from({ length: 6 }, (_, index) => ({
            id: `file-${index + 1}`,
            name: String(formData.get(`file_name_${index + 1}`) ?? "").trim(),
            category: String(formData.get(`file_category_${index + 1}`) ?? "").trim(),
            updatedAt: String(formData.get(`file_updated_at_${index + 1}`) ?? "").trim(),
            format: String(formData.get(`file_format_${index + 1}`) ?? "").trim(),
            size: String(formData.get(`file_size_${index + 1}`) ?? "").trim(),
          })).filter((item) => item.name && item.category)
        : baseSettings.files,
    reports:
      section === "reports"
        ? Array.from({ length: 4 }, (_, index) => ({
            id: `report-${index + 1}`,
            title: String(formData.get(`report_title_${index + 1}`) ?? "").trim(),
            period: String(formData.get(`report_period_${index + 1}`) ?? "").trim(),
            summary: String(formData.get(`report_summary_${index + 1}`) ?? "").trim(),
            metric: String(formData.get(`report_metric_${index + 1}`) ?? "").trim(),
          })).filter((item) => item.title && item.period)
        : baseSettings.reports,
    invoices:
      section === "reports"
        ? Array.from({ length: 4 }, (_, index) => ({
            id: `invoice-${index + 1}`,
            title: String(formData.get(`invoice_title_${index + 1}`) ?? "").trim(),
            period: String(formData.get(`invoice_period_${index + 1}`) ?? "").trim(),
            summary: String(formData.get(`invoice_summary_${index + 1}`) ?? "").trim(),
            metric: String(formData.get(`invoice_metric_${index + 1}`) ?? "").trim(),
          })).filter((item) => item.title && item.period)
        : baseSettings.invoices,
    messages:
      section === "messages"
        ? Array.from({ length: messageCount }, (_, index) => {
            const position = index + 1;
            return {
              deleted: String(formData.get(`message_delete_${position}`) ?? "").trim() === "1",
              item: {
                id: `message-${position}`,
                author: String(formData.get(`message_author_${position}`) ?? "").trim(),
                role: String(formData.get(`message_role_${position}`) ?? "").trim(),
                date: String(formData.get(`message_date_${position}`) ?? "").trim(),
                message: String(formData.get(`message_body_${position}`) ?? "").trim(),
              },
            };
          })
            .filter(({ deleted, item }) => !deleted && item.author && item.message)
            .map(({ item }, index) => ({
              ...item,
              id: `message-${index + 1}`,
            }))
        : baseSettings.messages,
    activityLog:
      section === "messages"
        ? Array.from({ length: activityCount }, (_, index) => {
            const position = index + 1;
            return {
              deleted: String(formData.get(`activity_delete_${position}`) ?? "").trim() === "1",
              item: {
                id: `log-${position}`,
                date: String(formData.get(`activity_date_${position}`) ?? "").trim(),
                item: String(formData.get(`activity_item_${position}`) ?? "").trim(),
                note: String(formData.get(`activity_note_${position}`) ?? "").trim(),
              },
            };
          })
            .filter(({ deleted, item }) => !deleted && item.item && item.note)
            .map(({ item }, index) => ({
              ...item,
              id: `log-${index + 1}`,
            }))
        : baseSettings.activityLog,
  };

  if (clientSlug) {
    const nextClients = currentClients.map((client) =>
      client.slug === clientSlug
        ? {
            ...client,
            portalSettings: nextSettings,
            updatedAt: new Date().toISOString(),
          }
        : client
    );

    const { data: existingClientsSetting, error: existingClientsError } = await adminClient!
      .from("site_settings")
      .select("key")
      .eq("key", "backstage_clients")
      .maybeSingle();

    if (existingClientsError) {
      buildBackstageRedirect(
        existingClientsError.message ||
          "We couldn’t load the client portal settings before saving.",
        "error",
        redirectTarget
      );
    }

    const clientPayload = {
      key: "backstage_clients",
      value: nextClients,
      updated_at: new Date().toISOString(),
    };

    const { error: clientSaveError } = existingClientsSetting
      ? await adminClient!
          .from("site_settings")
          .update({
            value: clientPayload.value,
            updated_at: clientPayload.updated_at,
          })
          .eq("key", clientPayload.key)
      : await adminClient!.from("site_settings").insert(clientPayload);

    if (clientSaveError) {
      buildBackstageRedirect(
        clientSaveError.message || "We couldn’t save this client portal yet.",
        "error",
        redirectTarget
      );
    }

    revalidatePath("/backoffice/backstage/clients");
    revalidatePath(`/backoffice/backstage/clients/${clientSlug}`);
    revalidatePath("/backoffice/backstage");
    revalidatePath("/backstage");
    revalidatePath("/backstage/login");
    revalidatePath(`/backstage/portal/${clientSlug}`);
    revalidatePath(`/backstage/portal/${clientSlug}/campaigns`);
    revalidatePath(`/backstage/portal/${clientSlug}/approvals`);
    revalidatePath(`/backstage/portal/${clientSlug}/files`);
    revalidatePath(`/backstage/portal/${clientSlug}/reports`);
    revalidatePath(`/backstage/portal/${clientSlug}/messages`);

    buildBackstageRedirect("Client portal updated successfully.", "success", redirectTarget);
  }

  const { data: existingSetting, error: existingError } = await adminClient!
    .from("site_settings")
    .select("key")
    .eq("key", "backstage_portal_settings")
    .maybeSingle();

  if (existingError) {
    buildBackstageRedirect(
      existingError.message || "We couldn’t load the backstage portal settings before saving.",
      "error",
      redirectTarget
    );
  }

  const payload = {
    key: "backstage_portal_settings",
    value: nextSettings,
    updated_at: new Date().toISOString(),
  };

  const { error } = existingSetting
    ? await adminClient!
        .from("site_settings")
        .update({
          value: payload.value,
          updated_at: payload.updated_at,
        })
        .eq("key", payload.key)
    : await adminClient!.from("site_settings").insert(payload);

  if (error) {
    buildBackstageRedirect(
      error.message || "We couldn’t save the backstage portal settings yet.",
      "error",
      redirectTarget
    );
  }

  revalidatePath("/backstage");
  revalidatePath("/backstage/login");
  revalidatePath("/backstage/portal");
  revalidatePath("/backstage/portal/campaigns");
  revalidatePath("/backstage/portal/approvals");
  revalidatePath("/backstage/portal/files");
  revalidatePath("/backstage/portal/reports");
  revalidatePath("/backstage/portal/messages");
  revalidatePath("/backoffice/backstage");
  revalidatePath("/backoffice/backstage/gateway");
  revalidatePath("/backoffice/backstage/login");
  revalidatePath("/backoffice/backstage/shell");
  revalidatePath("/backoffice/backstage/overview");
  revalidatePath("/backoffice/backstage/campaigns");
  revalidatePath("/backoffice/backstage/approvals");
  revalidatePath("/backoffice/backstage/files");
  revalidatePath("/backoffice/backstage/reports");
  revalidatePath("/backoffice/backstage/messages");

  buildBackstageRedirect("Backstage portal updated successfully.", "success", redirectTarget);
}

function slugifyClientName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createBackstageClientAction(formData: FormData) {
  await requireBackofficeAccess(["admin"]);

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildBackstageRedirect("Missing service role key in .env.local.", "error", "backstage:clients");
  }

  const companyName = String(formData.get("company_name") ?? "").trim();
  const logoUrl = String(formData.get("logo_url") ?? "").trim();
  const contactName = String(formData.get("contact_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const requestedSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugifyClientName(requestedSlug || companyName);

  if (!companyName || !contactName || !email || !password || !slug) {
    buildBackstageRedirect(
      "Please complete the client name, contact, email, password, and slug.",
      "error",
      "backstage:clients"
    );
  }

  const clients = await getBackstageClients();

  if (clients.some((client) => client.slug === slug)) {
    buildBackstageRedirect(
      "This client slug already exists. Please choose another one.",
      "error",
      "backstage:clients"
    );
  }

  const { data, error } = await adminClient!.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: "client",
      client_slug: slug,
      full_name: contactName,
      company_name: companyName,
    },
  });

  if (error || !data.user) {
    buildBackstageRedirect(
      error?.message || "We couldn’t create this client account yet.",
      "error",
      "backstage:clients"
    );
  }

  const nextClients = [
    ...clients,
    {
      id: `client-${Date.now()}`,
      slug,
      companyName,
      logoUrl,
      contactName,
      email,
      authUserId: data.user? .id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      portalSettings: await getBackstagePortalSettings(),
    },
  ];

  const { data: existingSetting, error: existingError } = await adminClient!
    .from("site_settings")
    .select("key")
    .eq("key", "backstage_clients")
    .maybeSingle();

  if (existingError) {
    buildBackstageRedirect(
      existingError.message || "We couldn’t load the client list before saving.",
      "error",
      "backstage:clients"
    );
  }

  const payload = {
    key: "backstage_clients",
    value: nextClients,
    updated_at: new Date().toISOString(),
  };

  const { error: saveError } = existingSetting
    ? await adminClient!
        .from("site_settings")
        .update({
          value: payload.value,
          updated_at: payload.updated_at,
        })
        .eq("key", payload.key)
    : await adminClient!.from("site_settings").insert(payload);

  if (saveError) {
    await adminClient!.auth.admin.deleteUser(data.user.id);
    buildBackstageRedirect(
      saveError.message || "The client account was created, but the portal record could not be saved.",
      "error",
      "backstage:clients"
    );
  }

  revalidatePath("/backoffice/backstage");
  revalidatePath("/backoffice/backstage/clients");
  buildBackstageRedirect("Client added successfully.", "success", "backstage:clients");
}

export async function removeBackstageClientAction(formData: FormData) {
  await requireBackofficeAccess(["admin"]);

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildBackstageRedirect("Missing service role key in .env.local.", "error", "backstage:clients");
  }

  const clientSlug = String(formData.get("client_slug") ?? "").trim();

  if (!clientSlug) {
    buildBackstageRedirect("Invalid client selected.", "error", "backstage:clients");
  }

  const clients = await getBackstageClients();
  const client = clients.find((entry) => entry.slug === clientSlug);

  if (!client) {
    buildBackstageRedirect("We couldn’t find this client anymore.", "error", "backstage:clients");
  }

  const { error: deleteError } = await adminClient!.auth.admin.deleteUser(client!.authUserId);

  if (deleteError) {
    buildBackstageRedirect(
      deleteError.message || "We couldn’t remove this client account yet.",
      "error",
      "backstage:clients"
    );
  }

  const nextClients = clients.filter((entry) => entry.slug !== clientSlug);
  const { error: saveError } = await adminClient!
    .from("site_settings")
    .update({
      value: nextClients,
      updated_at: new Date().toISOString(),
    })
    .eq("key", "backstage_clients");

  if (saveError) {
    buildBackstageRedirect(
      saveError.message || "The client account was removed, but the client list did not refresh correctly.",
      "error",
      "backstage:clients"
    );
  }

  revalidatePath("/backoffice/backstage");
  revalidatePath("/backoffice/backstage/clients");
  revalidatePath("/backstage");
  revalidatePath("/backstage/login");
  revalidatePath(`/backstage/portal/${clientSlug}`);
  buildBackstageRedirect("Client removed successfully.", "success", "backstage:clients");
}
