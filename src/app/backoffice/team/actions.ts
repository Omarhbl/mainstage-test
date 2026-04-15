"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

function buildTeamRedirect(message: string, type: "success" | "error") {
  const params = new URLSearchParams({
    notice: message,
    type,
  });

  redirect(`/backoffice/team?${params.toString()}`);
}

export async function updateMemberRoleAction(formData: FormData) {
  await requireBackofficeAccess(["admin"]);

  const memberId = String(formData.get("member_id") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!memberId || !["admin", "editor"].includes(role)) {
    buildTeamRedirect("Invalid member or role.", "error");
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildTeamRedirect("Missing service role key in .env.local.", "error");
  }

  const { error } = await adminClient!
    .from("profiles")
    .update({ role })
    .eq("id", memberId);

  if (error) {
    buildTeamRedirect("We couldn’t update that role. Please try again.", "error");
  }

  revalidatePath("/backoffice/team");
  buildTeamRedirect("Member role updated successfully.", "success");
}

export async function createMemberAction(formData: FormData) {
  await requireBackofficeAccess(["admin"]);

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!fullName || !email || !password || !["admin", "editor"].includes(role)) {
    buildTeamRedirect("Please complete all fields before creating a member.", "error");
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildTeamRedirect("Missing service role key in .env.local.", "error");
  }

  const { data, error } = await adminClient!.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (error || !data.user) {
    buildTeamRedirect(
      error?.message || "We couldn’t create that member. Please try again.",
      "error"
    );
  }

  const { error: profileError } = await adminClient!.from("profiles").upsert({
    id: data.user.id,
    full_name: fullName,
    role,
  });

  if (profileError) {
    buildTeamRedirect(
      "The member was created, but the role profile could not be saved.",
      "error"
    );
  }

  revalidatePath("/backoffice/team");
  buildTeamRedirect("New member added successfully.", "success");
}

export async function removeMemberAccessAction(formData: FormData) {
  await requireBackofficeAccess(["admin"]);

  const memberId = String(formData.get("member_id") ?? "").trim();

  if (!memberId) {
    buildTeamRedirect("Invalid member selected.", "error");
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildTeamRedirect("Missing service role key in .env.local.", "error");
  }

  const { error } = await adminClient!.from("profiles").delete().eq("id", memberId);

  if (error) {
    buildTeamRedirect("We couldn’t remove this access. Please try again.", "error");
  }

  revalidatePath("/backoffice/team");
  buildTeamRedirect("Backstage access removed successfully.", "success");
}

export async function updateDashboardEditorialNoteAction(formData: FormData) {
  await requireBackofficeAccess(["admin"]);

  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!title || !message) {
    buildTeamRedirect("Please complete the editorial note before saving.", "error");
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    buildTeamRedirect("Missing service role key in .env.local.", "error");
  }

  const updatedAt = new Intl.DateTimeFormat("en-GB").format(new Date());

  const { error } = await adminClient!.from("site_settings").upsert(
    {
      key: "dashboard_editorial_note",
      value: {
        title,
        message,
        updatedAt,
      },
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "key",
    }
  );

  if (error) {
    buildTeamRedirect(
      "We couldn’t save the dashboard note. Please check the site_settings table and try again.",
      "error"
    );
  }

  revalidatePath("/backoffice");
  revalidatePath("/backoffice/team");
  buildTeamRedirect("Dashboard editorial note updated successfully.", "success");
}
