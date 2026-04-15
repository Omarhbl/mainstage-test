import { NextResponse } from "next/server";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { getGuestlistSignups } from "@/lib/supabase/server";

function escapeCsvValue(value: string) {
  const normalized = value.replace(/"/g, '""');
  return `"${normalized}"`;
}

export async function GET() {
  await requireBackofficeAccess(["admin"]);

  const signups = await getGuestlistSignups();
  const rows = [
    ["email", "source", "status", "subscribed_at"],
    ...signups.map((signup) => [
      signup.email,
      signup.source,
      signup.status,
      signup.subscribedAt,
    ]),
  ];

  const csv = rows
    .map((row) => row.map((value) => escapeCsvValue(String(value ?? ""))).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mainstage-guestlist.csv"`,
    },
  });
}
