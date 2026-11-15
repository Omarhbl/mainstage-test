import { buildPageMetadata } from "@/lib/seo";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import LegalContentRenderer from "@/components/legal/LegalContentRenderer";
import { getSiteSettings } from "@/lib/supabase/server";

export const metadata = buildPageMetadata({ title: "Cookies Policy", description: "Learn about cookies and privacy choices on Mainstage.", path: "/cookies-privacy" });

export default async function CookiesPrivacyPage() {
  const siteSettings = await getSiteSettings();

  return (
    <LegalPageLayout title={siteSettings.legalPages.cookies.title}>
      <LegalContentRenderer
        effectiveDate={siteSettings.legalPages.cookies.effectiveDate}
        content={siteSettings.legalPages.cookies.content}
      />
    </LegalPageLayout>
  );
}
