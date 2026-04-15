import { redirect } from "next/navigation";
import { requireClientPortalAccess } from "@/lib/supabase/client-portal";

export default async function BackstagePartnerFilesPage() {
  const access = await requireClientPortalAccess();
  redirect(`/backstage/portal/${access.client.slug}/files`);
}
