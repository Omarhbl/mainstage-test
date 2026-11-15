/** Only stable, valid calendar dates belong in search metadata. */
export function parseSeoDate(value?: string | null): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  const display = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/);
  if (!display && !iso) return undefined;
  const [year, month, day] = display ? [Number(display[3]), Number(display[2]), Number(display[1])] : [Number(iso![1]), Number(iso![2]), Number(iso![3])];
  const calendar = new Date(Date.UTC(year, month - 1, day, 12));
  if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month - 1 || calendar.getUTCDate() !== day) return undefined;
  const date = raw.includes("T") ? new Date(raw) : calendar;
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}

export function articleModifiedDate(article: { date: string; updatedAt?: string }, now = Date.now()): string | undefined {
  const published = parseSeoDate(article.date);
  const updated = parseSeoDate(article.updatedAt);
  return updated && Date.parse(updated) <= now && (!published || Date.parse(updated) >= Date.parse(published)) ? updated : published;
}

export function serializeStructuredData(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
