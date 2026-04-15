import LegalPageLayout from "@/components/legal/LegalPageLayout";
import LegalContentRenderer from "@/components/legal/LegalContentRenderer";
import { getSiteSettings } from "@/lib/supabase/server";

export default async function PrivacyPolicyPage() {
  const siteSettings = await getSiteSettings();

  return (
    <LegalPageLayout title={siteSettings.legalPages.privacy.title}>
      <LegalContentRenderer
        effectiveDate={siteSettings.legalPages.privacy.effectiveDate}
        content={siteSettings.legalPages.privacy.content}
      />
    </LegalPageLayout>
  );
}
