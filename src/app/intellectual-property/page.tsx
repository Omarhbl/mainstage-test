import { buildPageMetadata } from "@/lib/seo";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import LegalContentRenderer from "@/components/legal/LegalContentRenderer";
import { getSiteSettings } from "@/lib/supabase/server";

export const metadata = buildPageMetadata({ title: "Intellectual Property", description: "Read the Mainstage intellectual property policy and content ownership information.", path: "/intellectual-property" });

export default async function IntellectualPropertyPage() {
  const siteSettings = await getSiteSettings();

  return (
    <LegalPageLayout title={siteSettings.legalPages.intellectual.title}>
      <LegalContentRenderer
        effectiveDate={siteSettings.legalPages.intellectual.effectiveDate}
        content={siteSettings.legalPages.intellectual.content}
      />
    </LegalPageLayout>
  );
}
