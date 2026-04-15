import Link from "next/link";
import { notFound } from "next/navigation";
import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import UpcomingEditorForm from "@/components/backoffice/UpcomingEditorForm";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import { getUpcomingSettings } from "@/lib/supabase/server";

const SECTION_COPY = {
  cinema: {
    label: "Cinema strip",
    title: "Upcoming releases",
    description:
      "Add or remove cinema slots whenever needed. Each entry can include a title, date, poster, and optional destination link.",
  },
  events: {
    label: "Events strip",
    title: "Upcoming events",
    description:
      "Keep the events strip fresh with as many announcements, visuals, dates, and links as the team needs.",
  },
} as const;

export default async function BackofficeUpcomingSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  await requireBackofficeAccess(["admin", "editor"]);
  const { section } = await params;
  const { notice, type } = await searchParams;

  if (section !== "cinema" && section !== "events") {
    notFound();
  }

  const upcomingSettings = await getUpcomingSettings();
  const copy = SECTION_COPY[section];
  const items = section === "events" ? upcomingSettings.entertainment : upcomingSettings.cinema;

  return (
    <div className="space-y-8">
      <BackofficeHeader
        title={copy.title}
        subtitle="Use this editor to manage the live strip shown on the website. You can add more slots at any time."
        action={
          <Link
            href="/backoffice/upcoming"
            className="inline-flex h-[46px] items-center justify-center rounded-[12px] border border-black/10 bg-white px-5 text-[14px] font-body font-semibold text-[#181818] transition-opacity hover:opacity-80"
          >
            Back to Upcoming
          </Link>
        }
      />

      {notice ? (
        <div
          className={`rounded-[16px] border px-4 py-3 text-[14px] font-body leading-[1.7] ${
            type === "success"
              ? "border-[#0f8b4c]/15 bg-[#0f8b4c]/6 text-[#0f8b4c]"
              : "border-[#CE2127]/15 bg-[#CE2127]/6 text-[#9f1b20]"
          }`}
        >
          {notice}
        </div>
      ) : null}

      <UpcomingEditorForm
        section={section}
        label={copy.label}
        title={copy.title}
        description={copy.description}
        items={items}
      />
    </div>
  );
}
