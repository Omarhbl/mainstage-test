import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import SectionCard from "@/components/backoffice/SectionCard";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { getAppSettings } from "@/lib/app-config-store";
export default async function AppSettingsPage() {
  await requireBackofficeAccess(["admin"]);
  const { sections } = await getAppSettings();
  return <div className="space-y-8"><BackofficeHeader title="Mainstage App" subtitle="Manage the radio, themed stations, app campaigns and feature switches. Changes reach the app through its configuration feed." />
    {!sections.radio.streamUrl ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Radio setup: add the direct HTTPS listening URL from Caster.fm to configure the live player.</p> : null}
    <div className="grid gap-5 md:grid-cols-2"><SectionCard title="Radio" description="Station name, live stream, artwork and schedule." href="/backoffice/app/radio" /><SectionCard title="Switches" description="Show or hide ads and the Drop experience in the app." href="/backoffice/app/switches" /><SectionCard title="Webradios" description="Manage up to 12 themed stations, covers and display order." href="/backoffice/app/webradios" /><SectionCard title="App ads" description="Manage Home banner and rectangle campaigns, dates and links." href="/backoffice/app/ads" /></div>
    <div className="rounded-xl border border-black/10 bg-white p-5 text-sm text-black/70"><p>The Drop content editor is planned for the Drop launch.</p><a className="mt-3 inline-block font-semibold text-[#a51b20] underline" href="/api/app/config" target="_blank" rel="noopener noreferrer">View public app configuration</a><p className="mt-2">Only public listening links and content belong here. Never enter passwords, API keys or streaming account credentials.</p></div>
  </div>;
}
