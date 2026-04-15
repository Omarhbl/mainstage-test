import BackofficeShell from "@/components/backoffice/BackofficeShell";
import FeedAutoRefreshHeartbeat from "@/components/layout/FeedAutoRefreshHeartbeat";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";

export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, fullName } = await requireBackofficeAccess();

  return (
    <BackofficeShell role={role} fullName={fullName}>
      <FeedAutoRefreshHeartbeat />
      {children}
    </BackofficeShell>
  );
}
