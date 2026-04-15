import { redirect } from "next/navigation";
import { requireClientPortalAccess } from "@/lib/supabase/client-portal";

export default async function BackstagePartnerApprovalsPage() {
  const access = await requireClientPortalAccess();
  redirect(`/backstage/portal/${access.client.slug}/approvals`);
}
