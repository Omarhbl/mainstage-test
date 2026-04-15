"use server";

import { redirect } from "next/navigation";
import {
  createSupabaseServerClient,
  getBackstageClientBySlug,
  getBackstageClientByUserId,
  hasSupabaseEnv,
} from "@/lib/supabase/server";

type ClientMetadata = {
  role?: string;
  client_slug?: string;
};

export async function signInClientPortalAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/backstage/login?error=config");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

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

  const metadata = (user?.user_metadata ?? {}) as ClientMetadata;

  if (metadata.role !== "client") {
    await supabase.auth.signOut();
    redirect("/backstage/login?error=access");
  }

  const client =
    (metadata.client_slug
      ? await getBackstageClientBySlug(metadata.client_slug)
      : null) ?? (user ? await getBackstageClientByUserId(user.id) : null);

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
