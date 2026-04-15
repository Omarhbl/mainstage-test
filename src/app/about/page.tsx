import SiteFooter from "@/components/layout/SiteFooter";
import { getSiteSettings } from "@/lib/supabase/server";

export default async function AboutPage() {
  const siteSettings = await getSiteSettings();
  const introParagraphs = siteSettings.aboutPage.introContent
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <section className="mx-auto max-w-[1116px] px-4 py-16 md:px-6 md:py-18">
          <div className="mx-auto max-w-[650px] text-center">
            <h1 className="text-[31px] font-body font-bold tracking-[-0.03em] text-[#181818]">
              {siteSettings.aboutPage.title}
            </h1>

            <div className="mt-8 space-y-5 text-[16px] font-body font-normal leading-[1.8] text-[rgba(0,0,0,0.72)]">
              {introParagraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
              ))}
            </div>

            <p className="mt-7 text-[16px] font-body font-bold text-[#181818]">
              {siteSettings.aboutPage.signature}
            </p>
          </div>

          <div className="mt-16 border-t border-black/10 pt-16">
            <div className="text-center">
              <h2 className="text-[29px] font-body font-bold tracking-[-0.03em] text-[#181818]">
                {siteSettings.aboutPage.coverageTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-[680px] text-[20px] font-body font-normal leading-[1.5] text-[rgba(0,0,0,0.68)]">
                {siteSettings.aboutPage.coverageSubtitle}
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
              {siteSettings.aboutPage.coverageItems.map((item) => (
                <article key={item.title} className="max-w-[321px]">
                  <div className="h-[191px] overflow-hidden rounded-[8px] bg-[#e7e1db]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="pt-4">
                    <h3 className="text-[18px] font-body font-bold leading-[1.35] tracking-[-0.02em] text-[#181818]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[12px] font-body font-normal leading-[1.6] text-[rgba(0,0,0,0.65)]">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
