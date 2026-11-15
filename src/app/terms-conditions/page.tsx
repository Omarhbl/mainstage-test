import { buildPageMetadata } from "@/lib/seo";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import LegalContentRenderer from "@/components/legal/LegalContentRenderer";
import { getSiteSettings } from "@/lib/supabase/server";

export const metadata = buildPageMetadata({ title: "Terms & Conditions", description: "Read the terms and conditions for using the Mainstage website.", path: "/terms-conditions" });

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
