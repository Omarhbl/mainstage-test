import SiteFooter from "@/components/layout/SiteFooter";
import ContactForm from "@/components/contact/ContactForm";
import { getSiteSettings } from "@/lib/supabase/server";

export default async function ContactPage() {
  const siteSettings = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <section className="mx-auto max-w-[1116px] px-4 py-16 md:px-6 md:py-20">
          <div className="mx-auto max-w-[760px] text-center">
            <h1 className="text-[31px] font-body font-bold tracking-[-0.03em] text-[#181818]">
              Get in touch with us
            </h1>

            <div className="mt-8 space-y-5 text-[16px] font-body font-normal leading-[1.85] text-[rgba(0,0,0,0.72)]">
              <p>
                Mainstage is more than a platform, it&apos;s a space where culture,
                stories, and people connect.
              </p>
              <p>
                We exist at the intersection of entertainment, creativity, and
                industry, spotlighting what moves the scene forward. Whether
                you&apos;re a brand looking to collaborate, an artist with a vision,
                or part of the culture shaping what&apos;s next, this is your direct
                line to us.
              </p>
              <p>
                From partnerships and media inquiries to creative ideas and
                opportunities, we&apos;re always open to meaningful conversations.
              </p>
              <p>Let&apos;s build what&apos;s next, together.</p>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 overflow-hidden rounded-[10px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)] lg:grid-cols-[355px_minmax(0,1fr)]">
            <div className="relative overflow-hidden bg-[#CE2127] px-7 py-8 text-white">
              <h2 className="text-[31px] font-body font-bold tracking-[-0.03em]">
                Contact Information
              </h2>
              <div className="mt-3 h-[2px] w-12 bg-white/60" />

              <div className="mt-16 space-y-7">
                <p className="text-[15px] font-body font-medium text-white/95">
                  {siteSettings.contactEmail}
                </p>
              </div>

              <div className="pointer-events-none absolute bottom-6 right-6">
                <div className="h-[92px] w-[92px] rounded-full bg-white/16" />
                <div className="absolute -left-10 top-10 h-[92px] w-[92px] rounded-full bg-white/12" />
              </div>
            </div>

            <div className="bg-white px-7 py-8 md:px-10">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
