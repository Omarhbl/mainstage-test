"use server";

import { redirect } from "next/navigation";
import {
  createSupabaseServerClient,
  getBackstageClientByUserId,
  hasSupabaseEnv,
} from "@/lib/supabase/server";

export async function signInClientPortalAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/backstage/login?error=config");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/backstage/login?error=missing");
  }

  const supabase = await createSupabaseServerClient("client");

  if (!supabase) {
    redirect("/backstage/login?error=config");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/backstage/login?error=invalid");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const client = user ? await getBackstageClientByUserId(user.id) : null;

  if (!client) {
    await supabase.auth.signOut();
    redirect("/backstage/login?error=access");
  }

  redirect(`/backstage/portal/${client.slug}`);
}

export async function signOutClientPortalAction() {
  const supabase = await createSupabaseServerClient("client");

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/backstage/login");
}
