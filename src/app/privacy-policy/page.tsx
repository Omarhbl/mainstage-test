import { buildPageMetadata } from "@/lib/seo";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import LegalContentRenderer from "@/components/legal/LegalContentRenderer";
import { getSiteSettings } from "@/lib/supabase/server";

export const metadata = buildPageMetadata({ title: "Privacy Policy", description: "Learn how Mainstage collects, uses, and protects personal information.", path: "/privacy-policy" });

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
