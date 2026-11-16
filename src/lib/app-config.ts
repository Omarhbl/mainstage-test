/** Public mobile-app contract. Only non-secret presentation and listening URLs belong here. */
export type RadioSlot = { days: number[]; from: string; to: string; show: string };
export type AppRadio = { name: string; subtitle: string; streamUrl: string; artworkUrl: string; nowPlayingUrl: string | null; schedule: RadioSlot[] };
export type AppWebradio = { id: string; name: string; tagline: string; streamUrl: string; imageUrl: string; color: string; order: number; active: boolean };
export type AppAd = { id: string; slot: "home_banner" | "home_mrec"; advertiser: string; imageUrl: string; linkUrl: string; startsAt: string | null; endsAt: string | null; active: boolean };
export type AppFeatures = { ads: boolean; drop: boolean };
export type AppSections = { radio: AppRadio; webradios: AppWebradio[]; ads: AppAd[]; switches: AppFeatures };
export type AppSection = keyof AppSections;
export type AppConfig = { version: 1; updatedAt: string; features: AppFeatures; radio: AppRadio; webradios: AppWebradio[]; ads: AppAd[] };
export const APP_SECTIONS = ["radio", "switches", "webradios", "ads"] as const;
export const APP_DEFAULTS: AppSections = {
  radio: { name: "Mainstage Radio", subtitle: "", streamUrl: "", artworkUrl: "", nowPlayingUrl: null, schedule: [] },
  webradios: [], ads: [], switches: { ads: true, drop: false },
};

export function isHttpsUrl(value: string) {
  try { const url = new URL(value); return url.protocol === "https:" && !!url.hostname && !url.username && !url.password; } catch { return false; }
}
function text(value: unknown, label: string, max: number, required = false): string {
  if (typeof value !== "string" || value.trim().length > max || (required && !value.trim())) throw new Error(`${label}: ${required ? "required, " : ""}maximum ${max} characters.`);
  return value.trim();
}
function url(value: unknown, label: string, required = false) { const result = text(value ?? "", label, 2048, required); if (result && !isHttpsUrl(result)) throw new Error(`${label} must be a full HTTPS URL without embedded credentials.`); return result; }
function record(value: unknown): Record<string, unknown> { if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid settings data."); return value as Record<string, unknown>; }
function flag(value: unknown) { if (typeof value !== "boolean") throw new Error("Switches must be on or off."); return value; }
function integer(value: unknown, min: number, max: number, label: string) { if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) throw new Error(`${label} must be a whole number from ${min} to ${max}.`); return value; }
function list(value: unknown, max: number, label: string): unknown[] { if (!Array.isArray(value) || value.length > max) throw new Error(`${label}: maximum ${max} entries.`); return value; }
function time(value: unknown) { if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error("Schedule times must use HH:MM (24 hour). "); return value; }
function instant(value: unknown): string | null { if (!value) return null; if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) throw new Error("Ad dates must include a timezone."); return new Date(value).toISOString(); }
export function validateAppSection(section: AppSection, value: unknown): AppSections[AppSection] {
  if (section === "radio") {
    const v = record(value);
    return { name: text(v.name, "Station name", 40, true), subtitle: text(v.subtitle, "Subtitle", 40), streamUrl: url(v.streamUrl, "Radio stream", true), artworkUrl: url(v.artworkUrl, "Artwork"), nowPlayingUrl: url(v.nowPlayingUrl, "Now-playing URL") || null,
      schedule: list(v.schedule, 100, "Schedule").map((entry) => { const slot = record(entry); const days = [...new Set(list(slot.days, 7, "Days").map(day => integer(day, 0, 6, "Day")))]; if (!days.length) throw new Error("Choose at least one day per schedule slot."); const from = time(slot.from), to = time(slot.to); if (from === to) throw new Error("A show must have different start and end times."); return { days, from, to, show: text(slot.show, "Show name", 80, true) }; }) };
  }
  if (section === "switches") { const v = record(value); return { ads: flag(v.ads), drop: flag(v.drop) }; }
  if (section === "webradios") {
    const ids = new Set<string>();
    return list(value, 12, "Webradios").map((entry) => { const v = record(entry); const id = text(v.id, "Webradio ID", 48, true); if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || ids.has(id)) throw new Error("Webradio IDs must be unique lowercase slugs."); ids.add(id); const color = text(v.color ?? "", "Colour", 7); if (color && !/^#[0-9a-f]{6}$/i.test(color)) throw new Error("Colour must use #RRGGBB."); return { id, name: text(v.name, "Webradio name", 24, true), tagline: text(v.tagline, "Tagline", 40), streamUrl: url(v.streamUrl, "Webradio stream"), imageUrl: url(v.imageUrl, "Cover image", true), color: color || "#1D1D1F", order: integer(v.order, 0, 999, "Order"), active: flag(v.active) }; });
  }
  const ids = new Set<string>();
  const ads = list(value, 100, "Ad campaigns").map((entry): AppAd => { const v = record(entry); const id = text(v.id, "Campaign ID", 80, true); if (ids.has(id)) throw new Error("Campaign IDs must be unique."); ids.add(id); if (v.slot !== "home_banner" && v.slot !== "home_mrec") throw new Error("Choose a valid ad slot."); const startsAt = instant(v.startsAt), endsAt = instant(v.endsAt); if (startsAt && endsAt && endsAt <= startsAt) throw new Error("An ad must end after it starts."); return { id, slot: v.slot, advertiser: text(v.advertiser, "Advertiser", 100), imageUrl: url(v.imageUrl, "Ad image", true), linkUrl: url(v.linkUrl, "Ad link"), startsAt, endsAt, active: flag(v.active) }; });
  for (let i = 0; i < ads.length; i++) for (let j = i + 1; j < ads.length; j++) { const a = ads[i], b = ads[j]; if (a.active && b.active && a.slot === b.slot && (a.startsAt ? Date.parse(a.startsAt) : -Infinity) < (b.endsAt ? Date.parse(b.endsAt) : Infinity) && (b.startsAt ? Date.parse(b.startsAt) : -Infinity) < (a.endsAt ? Date.parse(a.endsAt) : Infinity)) throw new Error("Active campaigns in the same slot cannot have overlapping dates. Disable one or adjust its dates."); }
  return ads;
}
export function publicAppConfig(sections: AppSections, updatedAt: string | null, now = Date.now()): AppConfig {
  return { version: 1, updatedAt: updatedAt ?? new Date(0).toISOString(), features: sections.switches, radio: sections.radio, webradios: [...sections.webradios].sort((a,b) => a.order - b.order), ads: sections.switches.ads ? sections.ads.filter(ad => ad.active && (!ad.startsAt || Date.parse(ad.startsAt) <= now) && (!ad.endsAt || Date.parse(ad.endsAt) > now)) : [] };
}
