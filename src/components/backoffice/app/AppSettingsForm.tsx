"use client";
import { useActionState, useId, useState, type ReactNode } from "react";
import { saveAppSettingsAction } from "@/app/backoffice/app/actions";
import { type AppSections, type AppSection, type AppWebradio, type AppAd, isHttpsUrl, APP_RADIO_NOW_PLAYING_URL } from "@/lib/app-config";
import AppImageField from "./AppImageField";

const inputClass = "mt-2 w-full rounded-xl border border-black/15 bg-[#faf8f6] px-3 py-2.5 text-sm outline-none focus:border-[#CE2127]";
const buttonClass = "rounded-lg border border-black/15 px-3 py-2 text-sm font-medium hover:bg-black/5 disabled:opacity-40";
function Field({ label, children, help }: { label: string; children: ReactNode; help?: string }) { return <label className="block text-sm font-medium">{label}{children}{help ? <span className="mt-1 block text-xs font-normal text-black/60">{help}</span> : null}</label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="h-4 w-4 accent-[#CE2127]" />{label}</label>; }
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AppSettingsForm({ section, initial }: { section: AppSection; initial: AppSections }) {
  const [settings, setSettings] = useState(initial);
  const [state, action, pending] = useActionState(saveAppSettingsAction, { ok: false, message: "" });
  const [uploads, setUploads] = useState(0);
  const lockedIds = initial.webradios.map(item => item.id);
  const [originalIds] = useState(initial.webradios.map(item => item.id));
  const id = useId();
  const busy = (uploading: boolean) => setUploads(count => Math.max(0, count + (uploading ? 1 : -1)));
  function radio(patch: Partial<AppSections["radio"]>) { setSettings(current => ({ ...current, radio: { ...current.radio, ...patch } })); }
  function webradio(index: number, patch: Partial<AppWebradio>) { setSettings(current => ({ ...current, webradios: current.webradios.map((item, at) => at === index ? { ...item, ...patch } : item) })); }
  function ad(index: number, patch: Partial<AppAd>) { setSettings(current => ({ ...current, ads: current.ads.map((item, at) => at === index ? { ...item, ...patch } : item) })); }
  function utcInput(value: string | null) { return value?.slice(0, 16) ?? ""; }
  return <form action={async data => { await action(data); }} className="space-y-6">
    <input type="hidden" name="section" value={section} />
    <input type="hidden" name="settings" value={JSON.stringify(settings[section])} />
    <input type="hidden" name="originalIds" value={JSON.stringify(originalIds)} />
    <fieldset disabled={pending} className="space-y-6 disabled:opacity-70">
    {section === "radio" ? <>
      <div className="rounded-xl border border-black/10 bg-white p-5 text-sm text-black/70">
        <p>Station name, subtitle and artwork also provide the app’s phone and car display branding. Live song details stay separate inside the app.</p>
        <a href={APP_RADIO_NOW_PLAYING_URL} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold text-[#a51b20] underline">View live radio metadata</a>
      </div>
      <div className="grid gap-5 rounded-2xl border border-black/10 bg-white p-6 md:grid-cols-2">
        <Field label="Station name"><input required maxLength={40} value={settings.radio.name} onChange={event => radio({ name: event.target.value })} className={inputClass} /></Field>
        <Field label="Subtitle"><input maxLength={40} value={settings.radio.subtitle} onChange={event => radio({ subtitle: event.target.value })} className={inputClass} /></Field>
        <div className="md:col-span-2"><Field label="Direct audio stream URL" help="The Mainstage AzuraCast stream is ready below. Use a direct HTTPS audio URL, not the player page or dashboard."><input type="url" required pattern="https://.*" value={settings.radio.streamUrl} onChange={event => radio({ streamUrl: event.target.value })} className={inputClass} placeholder="https://…" /></Field></div>
        <div className="md:col-span-2"><AppImageField label="Radio artwork (optional)" value={settings.radio.artworkUrl} kind="radio" onChange={artworkUrl => radio({ artworkUrl })} onBusy={busy} /></div>
        <div className="md:col-span-2"><Field label="Now-playing JSON URL (optional)" help="Leave empty to use Mainstage’s live track, artwork, next-track and history feed. Set only if the app should use another public metadata source."><input type="url" pattern="https://.*" value={settings.radio.nowPlayingUrl ?? ""} onChange={event => radio({ nowPlayingUrl: event.target.value || null })} className={inputClass} /></Field></div>
        {isHttpsUrl(settings.radio.streamUrl) ? <div className="md:col-span-2 space-y-2"><a href={settings.radio.streamUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#a51b20] underline">Open stream to test playback</a><audio controls preload="none" src={settings.radio.streamUrl} className="w-full" /><p className="text-xs text-black/60">The browser may not support HLS. Confirm playback on the app’s devices too.</p></div> : null}
      </div>
      <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-6"><h2 className="text-lg font-bold">Schedule</h2><p className="text-sm text-black/65">Morocco time (Africa/Casablanca). Stored for the future off-air message. End times earlier than start times run overnight.</p>
        {settings.radio.schedule.map((slot, index) => <fieldset key={index} className="space-y-4 rounded-xl border border-black/10 p-4"><legend className="px-1 text-sm font-semibold">Show {index + 1}</legend><Field label="Show name"><input required value={slot.show} maxLength={80} className={inputClass} onChange={event => radio({ schedule: settings.radio.schedule.map((s, at) => at === index ? { ...s, show: event.target.value } : s) })} /></Field><div className="flex flex-wrap gap-3">{days.map((day, dayIndex) => <Toggle key={day} label={day} checked={slot.days.includes(dayIndex)} onChange={checked => radio({ schedule: settings.radio.schedule.map((s, at) => at === index ? { ...s, days: checked ? [...s.days, dayIndex] : s.days.filter(value => value !== dayIndex) } : s) })} />)}</div><div className="grid grid-cols-2 gap-3">{(["from", "to"] as const).map(key => <Field key={key} label={key === "from" ? "Start" : "End"}><input type="time" required value={slot[key]} className={inputClass} onChange={event => radio({ schedule: settings.radio.schedule.map((s, at) => at === index ? { ...s, [key]: event.target.value } : s) })} /></Field>)}</div><button type="button" className={buttonClass} onClick={() => radio({ schedule: settings.radio.schedule.filter((_,at) => at !== index) })}>Remove show</button></fieldset>)}
        <button type="button" className={buttonClass} disabled={settings.radio.schedule.length >= 100} onClick={() => radio({ schedule: [...settings.radio.schedule, { days: [1,2,3,4,5], from: "18:00", to: "22:00", show: "" }] })}>Add show</button>
      </div>
    </> : null}
    {section === "switches" ? <div className="space-y-6 rounded-2xl border border-black/10 bg-white p-6"><div><Toggle label="Show ads in the app" checked={settings.switches.ads} onChange={ads => setSettings(current => ({ ...current, switches: { ...current.switches, ads } }))} /><p className="mt-2 text-sm text-black/65">Off hides both Home ad spaces. Campaign settings are retained.</p></div><div><Toggle label="Show Drop tab and Home card" checked={settings.switches.drop} onChange={drop => setSettings(current => ({ ...current, switches: { ...current.switches, drop } }))} /><p className="mt-2 text-sm text-black/65">Keep off until launch. The Drop content editor will be added in the launch phase; enabling this uses the content already bundled in the app.</p></div></div> : null}
    {section === "webradios" ? <>
      <p className="text-sm text-black/65">Up to 12 stations. Lowest order appears first; the first station gets the large tile. An empty stream shows “Coming soon”. An empty list uses the app’s built-in five stations.</p>
      {settings.webradios.map((station,index) => <fieldset key={`${id}-${index}`} className="space-y-5 rounded-2xl border border-black/10 bg-white p-6"><legend className="px-2 font-bold">{station.name || `Webradio ${index+1}`}</legend><div className="grid gap-5 md:grid-cols-2">
        <Field label="Permanent ID" help="Lowercase letters, numbers and hyphens. Locked after saving."><input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={48} readOnly={lockedIds.includes(station.id)} value={station.id} onChange={event => webradio(index,{id:event.target.value})} className={`${inputClass} read-only:bg-black/5`} /></Field>
        <Field label="Name"><input required maxLength={24} value={station.name} onChange={event => webradio(index,{name:event.target.value})} className={inputClass} /></Field>
        <Field label="Tagline"><input maxLength={40} value={station.tagline} onChange={event => webradio(index,{tagline:event.target.value})} className={inputClass} /></Field>
        <Field label="Order"><input type="number" min={0} max={999} required value={station.order} onChange={event => webradio(index,{order:Number(event.target.value)})} className={inputClass} /></Field>
        <div className="md:col-span-2"><Field label="Stream URL (optional)"><input type="url" pattern="https://.*" value={station.streamUrl} onChange={event => webradio(index,{streamUrl:event.target.value})} className={inputClass} /></Field></div>
        <AppImageField label="Cover image" value={station.imageUrl} kind="webradio" onChange={imageUrl => webradio(index,{imageUrl})} onBusy={busy} />
        <div className="space-y-5"><Field label="Loading colour"><input type="color" value={station.color} onChange={event => webradio(index,{color:event.target.value})} className="mt-2 block h-10 w-20" /></Field><Toggle label="Active in app" checked={station.active} onChange={active => webradio(index,{active})} /></div>
      </div><button type="button" className={buttonClass} disabled={uploads > 0} onClick={() => setSettings(current => ({...current,webradios:current.webradios.filter((_,at)=>at!==index)}))}>Remove webradio</button></fieldset>)}
      <button type="button" className={buttonClass} disabled={settings.webradios.length >= 12 || uploads > 0} onClick={() => setSettings(current => ({...current,webradios:[...current.webradios,{id:"",name:"",tagline:"",streamUrl:"",imageUrl:"",color:"#1D1D1F",order:current.webradios.length+1,active:true}]}))}>Add webradio</button>
    </> : null}
    {section === "ads" ? <>
      <p className="text-sm text-black/65">App campaigns only. One active campaign per slot at a time; future campaigns can share a slot when their dates don’t overlap. All dates below use UTC.</p>
      {settings.ads.map((campaign,index) => <fieldset key={campaign.id} className="space-y-5 rounded-2xl border border-black/10 bg-white p-6"><legend className="px-2 font-bold">{campaign.advertiser || `Campaign ${index+1}`}</legend><div className="grid gap-5 md:grid-cols-2">
        <Field label="Placement"><select value={campaign.slot} onChange={event => ad(index,{slot:event.target.value as AppAd["slot"]})} className={inputClass}><option value="home_banner">Home banner · 320 × 100</option><option value="home_mrec">Home rectangle · 300 × 250</option></select></Field>
        <Field label="Advertiser" help="Used as the accessible name in the app."><input maxLength={100} value={campaign.advertiser} onChange={event => ad(index,{advertiser:event.target.value})} className={inputClass} /></Field>
        <div className="md:col-span-2"><AppImageField label="Ad image" value={campaign.imageUrl} kind={campaign.slot} onChange={imageUrl => ad(index,{imageUrl})} onBusy={busy} /></div>
        <div className="md:col-span-2"><Field label="Destination URL (optional)"><input type="url" pattern="https://.*" value={campaign.linkUrl} onChange={event => ad(index,{linkUrl:event.target.value})} className={inputClass} /></Field></div>
        <Field label="Starts (UTC, optional)"><input type="datetime-local" value={utcInput(campaign.startsAt)} onChange={event => ad(index,{startsAt:event.target.value ? `${event.target.value}:00Z` : null})} className={inputClass} /></Field>
        <Field label="Ends (UTC, optional)"><input type="datetime-local" value={utcInput(campaign.endsAt)} onChange={event => ad(index,{endsAt:event.target.value ? `${event.target.value}:00Z` : null})} className={inputClass} /></Field>
      </div><div className="flex flex-wrap items-center justify-between gap-4"><Toggle label="Active campaign" checked={campaign.active} onChange={active=>ad(index,{active})} /><button type="button" className={buttonClass} disabled={uploads > 0} onClick={() => setSettings(current => ({...current,ads:current.ads.filter((_,at)=>at!==index)}))}>Remove campaign</button></div></fieldset>)}
      <button type="button" className={buttonClass} disabled={settings.ads.length >= 100 || uploads > 0} onClick={() => setSettings(current=>({...current,ads:[...current.ads,{id:crypto.randomUUID(),slot:"home_banner",advertiser:"",imageUrl:"",linkUrl:"",startsAt:null,endsAt:null,active:false}]}))}>Add campaign</button>
    </> : null}
    </fieldset>
    <div className="sticky bottom-4 flex flex-wrap items-center gap-4 rounded-2xl border border-black/15 bg-white p-4 shadow-lg">
      <button type="submit" disabled={pending || uploads > 0} className="rounded-xl bg-[#CE2127] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Saving…" : uploads > 0 ? "Wait for upload…" : "Save app settings"}</button>
      <p role="status" className={`max-w-xl text-sm ${state.ok ? "text-[#086b3b]" : "text-[#9f1b20]"}`}>{state.message}</p>
    </div>
  </form>;
}
