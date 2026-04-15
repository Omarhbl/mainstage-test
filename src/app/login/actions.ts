"use server";

import { redirect } from "next/navigation";
import {
  createSupabaseServerClient,
  hasSupabaseEnv,
} from "@/lib/supabase/server";
import type { BackofficeRole } from "@/lib/supabase/backoffice";

type RoleRow = {
  role?: string | null;
};

export async function signInAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/login?error=config");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    redirect("/login?error=missing");
  }

  const supabase = await createSupabaseServerClient("team");

  if (!supabase) {
    redirect("/login?error=config");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=invalid");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .maybeSingle<RoleRow>();

  const role = profile?.role as BackofficeRole | undefined;

  if (role !== "admin" && role !== "editor") {
    await supabase.auth.signOut();
    redirect("/login?error=access");
  }

  redirect("/backoffice");
}
