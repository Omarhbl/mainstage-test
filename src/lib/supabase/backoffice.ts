import { redirect } from "next/navigation";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

export type BackofficeRole = "admin" | "editor";

type ProfileRecord = {
  full_name?: string | null;
  role?: string | null;
};

function normalizeRole(role?: string | null): BackofficeRole | null {
  if (role === "admin" || role === "editor") {
    return role;
  }

  return null;
}

export async function requireBackofficeAccess(
  allowedRoles: BackofficeRole[] = ["admin", "editor"]
) {
  if (!hasSupabaseEnv()) {
    redirect("/login?error=config");
  }

  const supabase = await createSupabaseServerClient("team");

  if (!supabase) {
    redirect("/login?error=config");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle<ProfileRecord>();

  const role = normalizeRole(profile?.role);

  if (!role) {
    redirect("/access-denied");
  }

  if (!allowedRoles.includes(role)) {
    redirect("/access-denied");
  }

  return {
    user,
    role,
    fullName: profile?.full_name?.trim() || user.email || "Mainstage team member",
  };
}
