/** Accept a PEM value, a quoted JSON value, or a Google service-account JSON file. */
export function normalizeAnalyticsKey(raw: string): string {
  let value = raw.trim();
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed === "string") value = parsed;
    else if (parsed && typeof parsed === "object" && "private_key" in parsed && typeof parsed.private_key === "string") value = parsed.private_key;
  } catch {
    // A copied JSON field or plain PEM can still contain a complete key.
  }
  value = value.replace(/\\+r\\+n|\\+n|\\+r/g, "\n");
  const match = value.match(/-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----/);
  if (!match) throw new Error("Invalid Analytics key format");
  const body = match[1].replace(/\s/g, "");
  if (!body || !/^[A-Za-z0-9+/]+={0,2}$/.test(body)) throw new Error("Invalid Analytics key format");
  return `-----BEGIN PRIVATE KEY-----\n${body.match(/.{1,64}/g)!.join("\n")}\n-----END PRIVATE KEY-----\n`;
}
