import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

type GuestlistEntry = {
  email: string;
  source: string;
  status: string;
  subscribedAt: string;
};

function normalizeGuestlistEntries(value: unknown): GuestlistEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const record = entry as Partial<GuestlistEntry>;
      const email =
        typeof record.email === "string" ? record.email.trim().toLowerCase() : "";

      if (!email || !EMAIL_PATTERN.test(email)) {
        return null;
      }

      return {
        email,
        source:
          typeof record.source === "string" && record.source.trim()
            ? record.source.trim()
            : "footer_guestlist",
        status:
          typeof record.status === "string" && record.status.trim()
            ? record.status.trim()
            : "active",
        subscribedAt:
          typeof record.subscribedAt === "string" && record.subscribedAt.trim()
            ? record.subscribedAt.trim()
            : new Date().toISOString(),
      };
    })
    .filter(Boolean) as GuestlistEntry[];
}

async function saveGuestlistToCloudflare(email: string) {
  const endpoint = process.env.CLOUDFLARE_GUESTLIST_ENDPOINT?.trim();

  if (!endpoint) {
    return false;
  }

  const token = process.env.CLOUDFLARE_GUESTLIST_TOKEN?.trim();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      email,
      source: "footer_guestlist",
      subscribedAt: new Date().toISOString(),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || "Cloudflare guestlist storage failed.");
  }

  return true;
}

async function saveGuestlistToSupabase(email: string) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    throw new Error("Missing Supabase service role key.");
  }

  const now = new Date().toISOString();

  const { error: tableError } = await adminClient.from("guestlist_signups").upsert(
    {
      email,
      source: "footer_guestlist",
      status: "active",
      subscribed_at: now,
      updated_at: now,
    },
    {
      onConflict: "email",
    }
  );

  if (!tableError) {
    return;
  }

  const { data: existingFallback, error: existingFallbackError } = await adminClient
    .from("site_settings")
    .select("value")
    .eq("key", "guestlist_signups")
    .maybeSingle();

  if (existingFallbackError) {
    throw new Error(existingFallbackError.message);
  }

  const existingEntries = normalizeGuestlistEntries(
    existingFallback?.value && typeof existingFallback.value === "object"
      ? (existingFallback.value as { entries?: unknown }).entries
      : []
  );

  const nextEntries = [
    {
      email,
      source: "footer_guestlist",
      status: "active",
      subscribedAt: now,
    },
    ...existingEntries.filter((entry) => entry.email !== email),
  ];

  const payload = {
    key: "guestlist_signups",
    value: {
      entries: nextEntries,
    },
    updated_at: now,
  };

  const { error: fallbackSaveError } = await adminClient
    .from("site_settings")
    .upsert(payload, { onConflict: "key" });

  if (fallbackSaveError) {
    throw new Error(fallbackSaveError.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown };
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    const savedInCloudflare = await saveGuestlistToCloudflare(email);

    if (!savedInCloudflare) {
      await saveGuestlistToSupabase(email);
    }

    return NextResponse.json({
      success: true,
      message: "Access granted. You’re on the guestlist.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error && error.message
            ? error.message
            : "We couldn’t save the email yet. Please try again.",
      },
      { status: 500 }
    );
  }
}
