import { NextResponse } from "next/server";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { getContactMessages } from "@/lib/supabase/server";

function escapeCsvValue(value: string) {
  const normalized = value.replace(/"/g, '""');
  return `"${normalized}"`;
}

export async function GET() {
  await requireBackofficeAccess(["admin", "editor"]);

  const messages = await getContactMessages();
  const rows = [
    ["first_name", "last_name", "email", "phone", "subject", "message", "source", "status", "received_at"],
    ...messages.map((message) => [
      message.firstName,
      message.lastName,
      message.email,
      message.phone,
      message.subject,
      message.message,
      message.source,
      message.status,
      message.receivedAt,
    ]),
  ];

  const csv = rows
    .map((row) => row.map((value) => escapeCsvValue(String(value ?? ""))).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mainstage-contact-messages.csv"`,
    },
  });
}
