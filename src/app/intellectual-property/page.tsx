import LegalPageLayout from "@/components/legal/LegalPageLayout";
import LegalContentRenderer from "@/components/legal/LegalContentRenderer";
import { getSiteSettings } from "@/lib/supabase/server";

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
