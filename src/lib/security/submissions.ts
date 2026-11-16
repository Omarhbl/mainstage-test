import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export class SubmissionError extends Error {
  constructor(message: string, public status = 400, public retryAfter?: number) { super(message); }
}

export async function readSubmissionJson(request: Request, maxBytes = 16000) {
  const origin = request.headers.get("origin");
  if (origin && !["https://www.themainstagent.com", "https://themainstagent.com", new URL(request.url).origin].includes(origin)) {
    throw new SubmissionError("This request is not allowed.", 403);
  }
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) {
    throw new SubmissionError("Send a JSON request.", 415);
  }
  if (Number(request.headers.get("content-length")) > maxBytes) throw new SubmissionError("Message is too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new SubmissionError("Invalid request.");
  const chunks: Uint8Array[] = []; let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > maxBytes) throw new SubmissionError("Message is too large.", 413);
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch { throw new SubmissionError("Invalid request."); }
}

export function boundedField(body: Record<string, unknown>, key: string, max: number) {
  const value = typeof body[key] === "string" ? body[key].trim() : "";
  if (value.length > max || /\u0000/.test(value)) throw new SubmissionError("Please shorten the submitted fields.");
  return value;
}

/** Shared database CAS counter: survives restarts and concurrent serverless instances. */
export async function limitSubmission(request: Request, kind: "contact" | "guestlist") {
  // Only trust forwarded IPs when Vercel supplies/overwrites them. Other hosting
  // environments share a conservative bucket until a trusted ingress is configured.
  const forwarded = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for") : null;
  const candidate = forwarded?.split(",")[0].trim() ?? "";
  const ip = isIP(candidate) ? candidate : "unknown";
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const client = createSupabaseAdminClient();
  if (!secret || !client) throw new SubmissionError("Please try again shortly.", 503);
  // Daily salt bounds tracking; neither the IP nor email is persisted here.
  const digest = createHmac("sha256", secret).update(`${new Date().toISOString().slice(0, 10)}:${ip}`).digest("hex");
  const key = `security_rate_${kind}_${digest}`;
  const windowMs = 10 * 60 * 1000, maximum = kind === "contact" ? 5 : 10;
  for (let attempt = 0; attempt < 8; attempt++) {
    const now = Date.now();
    const { data, error } = await client.from("site_settings").select("value,updated_at").eq("key", key).maybeSingle();
    if (error) throw new SubmissionError("Please try again shortly.", 503);
    const previous = data?.value as { count?: number; resetAt?: number } | undefined;
    const active = previous && Number(previous.resetAt) > now;
    const count = active ? Number(previous.count) || 0 : 0;
    const resetAt = active ? Number(previous!.resetAt) : now + windowMs;
    if (count >= maximum) throw new SubmissionError("Too many attempts. Please try again in a few minutes.", 429, Math.max(1, Math.ceil((resetAt - now) / 1000)));
    const row = { key, value: { count: count + 1, resetAt }, updated_at: new Date(now).toISOString() };
    if (!data) {
      const inserted = await client.from("site_settings").insert(row);
      if (!inserted.error) {
        // Only ephemeral limiter records expire; never prune inbox/settings data.
        await client.from("site_settings").delete().like("key", "security\\_rate\\_%")
          .lt("updated_at", new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString());
        return;
      }
      if (inserted.error.code !== "23505") throw new SubmissionError("Please try again shortly.", 503);
    } else {
      const updated = await client.from("site_settings").update(row).eq("key", key).eq("updated_at", data.updated_at).eq("value->>count", String(previous?.count ?? 0)).select("key");
      if (updated.error) throw new SubmissionError("Please try again shortly.", 503);
      if (updated.data?.length) return;
    }
  }
  throw new SubmissionError("Too many attempts. Please try again shortly.", 429, 60);
}

export function submissionFailure(error: unknown) {
  const known = error instanceof SubmissionError;
  if (!known) console.error("Public submission failed.");
  return Response.json({ success: false, message: known ? error.message : "We couldn’t save your submission. Please try again shortly." }, {
    status: known ? error.status : 503,
    headers: { "Cache-Control": "no-store", ...(known && error.retryAfter ? { "Retry-After": String(error.retryAfter) } : {}) },
  });
}
