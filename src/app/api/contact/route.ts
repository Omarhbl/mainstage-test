import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

type ContactPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  source: string;
  status: string;
  receivedAt: string;
};

function normalizeContactMessages(value: unknown): ContactPayload[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const record = entry as Partial<ContactPayload>;
      const email =
        typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
      const subject =
        typeof record.subject === "string" ? record.subject.trim() : "";
      const message =
        typeof record.message === "string" ? record.message.trim() : "";

      if (!email || !subject || !message) {
        return null;
      }

      return {
        firstName:
          typeof record.firstName === "string" ? record.firstName.trim() : "",
        lastName:
          typeof record.lastName === "string" ? record.lastName.trim() : "",
        email,
        phone: typeof record.phone === "string" ? record.phone.trim() : "",
        subject,
        message,
        source:
          typeof record.source === "string" && record.source.trim()
            ? record.source.trim()
            : "website_contact",
        status:
          typeof record.status === "string" && record.status.trim()
            ? record.status.trim()
            : "new",
        receivedAt:
          typeof record.receivedAt === "string" && record.receivedAt.trim()
            ? record.receivedAt.trim()
            : new Date().toISOString(),
      };
    })
    .filter(Boolean) as ContactPayload[];
}

async function saveContactToCloudflare(payload: ContactPayload) {
  const endpoint = process.env.CLOUDFLARE_CONTACT_ENDPOINT?.trim();

  if (!endpoint) {
    return false;
  }

  const token = process.env.CLOUDFLARE_CONTACT_TOKEN?.trim();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || "Cloudflare contact storage failed.");
  }

  return true;
}

async function saveContactToSupabase(payload: ContactPayload) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    throw new Error("Missing Supabase service role key.");
  }

  const { error: tableError } = await adminClient.from("contact_messages").insert({
    first_name: payload.firstName,
    last_name: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    subject: payload.subject,
    message: payload.message,
    source: payload.source,
    status: payload.status,
    received_at: payload.receivedAt,
    updated_at: payload.receivedAt,
  });

  if (!tableError) {
    return;
  }

  const { data: existingFallback, error: existingFallbackError } = await adminClient
    .from("site_settings")
    .select("value")
    .eq("key", "contact_messages")
    .maybeSingle();

  if (existingFallbackError) {
    throw new Error(existingFallbackError.message);
  }

  const existingEntries = normalizeContactMessages(
    existingFallback?.value && typeof existingFallback.value === "object"
      ? (existingFallback.value as { entries?: unknown }).entries
      : []
  );

  const nextEntries = [payload, ...existingEntries];

  const { error: fallbackSaveError } = await adminClient.from("site_settings").upsert(
    {
      key: "contact_messages",
      value: { entries: nextEntries },
      updated_at: payload.receivedAt,
    },
    { onConflict: "key" }
  );

  if (fallbackSaveError) {
    throw new Error(fallbackSaveError.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload: ContactPayload = {
      firstName:
        typeof body.firstName === "string" ? body.firstName.trim() : "",
      lastName: typeof body.lastName === "string" ? body.lastName.trim() : "",
      email: typeof body.email === "string" ? body.email.trim().toLowerCase() : "",
      phone: typeof body.phone === "string" ? body.phone.trim() : "",
      subject: typeof body.subject === "string" ? body.subject.trim() : "",
      message: typeof body.message === "string" ? body.message.trim() : "",
      source: "website_contact",
      status: "new",
      receivedAt: new Date().toISOString(),
    };

    if (!payload.firstName || !payload.lastName || !payload.subject || !payload.message) {
      return NextResponse.json(
        { success: false, message: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (!payload.email || !EMAIL_PATTERN.test(payload.email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const savedInCloudflare = await saveContactToCloudflare(payload);

    if (!savedInCloudflare) {
      await saveContactToSupabase(payload);
    }

    return NextResponse.json({
      success: true,
      message: "Message received. We’ll get back to you soon.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error && error.message
            ? error.message
            : "We couldn’t send your message yet. Please try again.",
      },
      { status: 500 }
    );
  }
}
