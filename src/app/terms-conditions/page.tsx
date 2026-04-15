import LegalPageLayout from "@/components/legal/LegalPageLayout";
import LegalContentRenderer from "@/components/legal/LegalContentRenderer";
import { getSiteSettings } from "@/lib/supabase/server";

export default async function TermsConditionsPage() {
  const siteSettings = await getSiteSettings();

  return (
    <LegalPageLayout title={siteSettings.legalPages.terms.title}>
      <LegalContentRenderer
        effectiveDate={siteSettings.legalPages.terms.effectiveDate}
        content={siteSettings.legalPages.terms.content}
      />
    </LegalPageLayout>
  );
}
