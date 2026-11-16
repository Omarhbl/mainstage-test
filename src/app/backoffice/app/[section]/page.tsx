import Link from "next/link";
import { notFound } from "next/navigation";
import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import AppSettingsForm from "@/components/backoffice/app/AppSettingsForm";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { getAppSettings } from "@/lib/app-config-store";
import { APP_SECTIONS, type AppSection } from "@/lib/app-config";
const headings = { radio: ["App radio", "Configure the live station and future schedule information."], switches: ["App switches", "Control which experiences appear in the mobile app."], webradios: ["App webradios", "Manage themed stations, covers and their display order."], ads: ["App campaigns", "Manage the two Home ad placements independently of website ads."] };
export default async function AppSectionPage({ params }: { params: Promise<{ section: string }> }) {
  await requireBackofficeAccess(["admin"]);
  const { section } = await params;
  if (!APP_SECTIONS.includes(section as AppSection)) notFound();
  const key = section as AppSection; const { sections } = await getAppSettings();
  return <div className="space-y-6"><Link href="/backoffice/app" className="text-sm font-semibold text-[#a51b20]">← App overview</Link><BackofficeHeader title={headings[key][0]} subtitle={headings[key][1]} /><AppSettingsForm section={key} initial={sections} /></div>;
}
