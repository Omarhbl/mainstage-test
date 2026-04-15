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
  full_name?: string;
};

export async function requireClientPortalAccess(expectedSlug?: string) {
  if (!hasSupabaseEnv()) {
    redirect("/backstage/login?error=config");
  }

  const supabase = await createSupabaseServerClient("client");

  if (!supabase) {
    redirect("/backstage/login?error=config");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/backstage/login?error=auth");
  }

  const metadata = (user.user_metadata ?? {}) as ClientMetadata;
  const metadataRole = metadata.role;
  const metadataSlug = metadata.client_slug;

  if (metadataRole !== "client") {
    redirect("/backstage/login?error=access");
  }

  const client =
    (metadataSlug ? await getBackstageClientBySlug(metadataSlug) : null) ??
    (await getBackstageClientByUserId(user.id));

  if (!client) {
    redirect("/backstage/login?error=access");
  }

  if (expectedSlug && client.slug !== expectedSlug) {
    redirect(`/backstage/portal/${client.slug}`);
  }

  return {
    user,
    client,
    fullName:
      typeof metadata.full_name === "string" && metadata.full_name.trim()
        ? metadata.full_name.trim()
        : client.contactName,
  };
}
