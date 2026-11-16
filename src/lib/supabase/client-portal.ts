import { redirect } from "next/navigation";
import {
  createSupabaseServerClient,
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
  // Authorization comes only from the server-managed account relationship.
  const client = await getBackstageClientByUserId(user.id);

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
