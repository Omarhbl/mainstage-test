import { notFound } from "next/navigation";
import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import ContactInboxSectionEditor from "@/components/backoffice/ContactInboxSectionEditor";
import GuestlistSectionEditor from "@/components/backoffice/GuestlistSectionEditor";
import SettingsSectionEditor from "@/components/backoffice/SettingsSectionEditor";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";
import {
  getContactMessages,
  getGuestlistSignups,
  getSiteSettings,
} from "@/lib/supabase/server";

const SETTINGS_SECTIONS = {
  about: {
    title: "About Us",
    subtitle: "Update the intro and coverage text shown on the About page.",
  },
  contact: {
    title: "Contact",
    subtitle: "Update the main contact email used on the website.",
  },
  "contact-inbox": {
    title: "Contact Inbox",
    subtitle: "Review every message sent from the Contact page and export the list whenever the team needs it.",
  },
  social: {
    title: "Social Links",
    subtitle: "Manage the footer links that point to your social platforms.",
  },
  guestlist: {
    title: "Guestlist",
    subtitle: "Review every email collected from the footer and export the list whenever the team needs it.",
  },
  footer: {
    title: "Footer",
    subtitle: "Keep the footer wording aligned with the current brand messaging.",
  },
  legal: {
    title: "Legal Links",
    subtitle: "Edit the legal labels and destinations shown in the footer.",
  },
  "legal-pages": {
    title: "Legal Pages",
    subtitle: "Edit the full content shown on the legal pages of the website.",
  },
} as const;

type SettingsSectionKey = keyof typeof SETTINGS_SECTIONS;

export default async function BackofficeSettingsSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  await requireBackofficeAccess(["admin"]);
  const { section } = await params;
  const { notice, type } = await searchParams;

  if (!(section in SETTINGS_SECTIONS)) {
    notFound();
  }

  const sectionKey = section as SettingsSectionKey;
  const config = SETTINGS_SECTIONS[sectionKey];
  const siteSettings = await getSiteSettings();
  const guestlistSignups =
    sectionKey === "guestlist" ? await getGuestlistSignups() : [];
  const contactMessages =
    sectionKey === "contact-inbox" ? await getContactMessages() : [];

  return (
    <div className="space-y-8">
      <BackofficeHeader title={config.title} subtitle={config.subtitle} />

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

      {sectionKey === "guestlist" ? (
        <GuestlistSectionEditor signups={guestlistSignups} />
      ) : sectionKey === "contact-inbox" ? (
        <ContactInboxSectionEditor messages={contactMessages} />
      ) : (
        <SettingsSectionEditor section={sectionKey} siteSettings={siteSettings} />
      )}
    </div>
  );
}
