import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import SectionCard from "@/components/backoffice/SectionCard";
import { requireBackofficeAccess } from "@/lib/supabase/backoffice";

export default async function BackofficeSettingsPage() {
  await requireBackofficeAccess(["admin"]);

  return (
    <div className="space-y-8">
      <BackofficeHeader
        title="Settings"
        subtitle="Choose which website setting page you want to update. Each card opens its own editor so the team can focus on one area at a time."
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard
          title="About Us"
          description="Edit the intro text and coverage wording used on the About page."
          href="/backoffice/settings/about"
        />
        <SectionCard
          title="Contact"
          description="Update the main contact email used across the website."
          href="/backoffice/settings/contact"
        />
        <SectionCard
          title="Contact Inbox"
          description="Review and export the messages sent from the Contact page."
          href="/backoffice/settings/contact-inbox"
        />
        <SectionCard
          title="Social Links"
          description="Edit the Instagram and YouTube links shown in the footer."
          href="/backoffice/settings/social"
        />
        <SectionCard
          title="Guestlist"
          description="Review newsletter signups collected from the footer and export the contact list."
          href="/backoffice/settings/guestlist"
        />
        <SectionCard
          title="Footer"
          description="Adjust the footer tagline and copyright text."
          href="/backoffice/settings/footer"
        />
        <SectionCard
          title="Legal Links"
          description="Change the footer legal labels and the destination of each legal link."
          href="/backoffice/settings/legal"
        />
        <SectionCard
          title="Legal Pages"
          description="Edit the full content of Terms, Privacy, Intellectual Property, and Cookies pages."
          href="/backoffice/settings/legal-pages"
        />
      </div>
    </div>
  );
}
