"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
            date: formattedDate,
            item: `Client message: ${subject}`,
            note: "A new message was sent from the client portal.",
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
  revalidatePath("/backoffice/backstage/clients");
  buildClientPortalRedirect(access.client.slug, "Your message was sent.", "success");
}
