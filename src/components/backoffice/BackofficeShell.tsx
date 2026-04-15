import BackofficeSidebar from "@/components/backoffice/BackofficeSidebar";
import type { BackofficeRole } from "@/lib/supabase/backoffice";

export default function BackofficeShell({
  children,
  role,
  fullName,
}: {
  children: React.ReactNode;
  role: BackofficeRole;
  fullName: string;
}) {
  return (
    <div className="flex min-h-screen bg-[#f6f4f1] text-[#181818]">
      <div className="hidden lg:block">
        <BackofficeSidebar role={role} fullName={fullName} />
      </div>

      <div className="flex min-h-screen w-full flex-col">
        <div className="border-b border-black/8 bg-white px-4 py-4 lg:hidden">
          <BackofficeSidebar role={role} fullName={fullName} />
        </div>
        <main className="flex-1 px-4 py-8 md:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1320px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
