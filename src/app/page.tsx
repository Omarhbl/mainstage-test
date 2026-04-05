import HeroDrop from "@/components/home/HeroDrop";
import EditorialGrid from "@/components/home/EditorialGrid";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroDrop />
      <EditorialGrid />
      
      {/* Footer */}
      <footer className="mt-auto bg-[#161616] text-white">
        <div className="mx-auto max-w-[1116px] px-4 py-14 md:px-6 md:py-16">
          <div className="grid grid-cols-1 gap-14 xl:grid-cols-[minmax(0,1fr)_262px]">
            <div className="max-w-[530px]">
              <img
                src="/mainstage-logo.png"
                alt="Mainstage"
                className="w-[170px]"
              />

              <p className="mt-4 text-[18px] font-body font-normal leading-none text-white/90">
                For the Culture. For the Industry.
              </p>

              <div className="mt-10">
                <p className="text-[16px] font-body font-bold uppercase text-white">
                  FOLLOW US
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <SocialIcon href="#" label="Instagram">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth="1.8">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4.2" />
                      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  </SocialIcon>
                  <SocialIcon href="#" label="YouTube">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth="1.8">
                      <rect x="3" y="6.5" width="18" height="11" rx="3.2" />
                      <path d="M10 9.6 15.5 12 10 14.4Z" fill="currentColor" stroke="none" />
                    </svg>
                  </SocialIcon>
                </div>
              </div>

              <div className="mt-10">
                <p className="text-[16px] font-body font-bold uppercase text-white">
                  JOIN THE GUESTLIST
                </p>
                <div className="mt-4 flex max-w-[496px] flex-col overflow-hidden border border-[#CE2127] sm:flex-row">
                  <input
                    type="email"
                    placeholder="Enter your email ...."
                    className="h-[58px] flex-1 bg-[#3a3a3a] px-4 text-[16px] font-body text-white placeholder:text-white/55 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="h-[58px] bg-[#CE2127] px-8 text-[14px] font-body font-bold uppercase tracking-[0.01em] text-white transition-opacity hover:opacity-90"
                  >
                    GET YOUR ACCESS
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-14 gap-y-6 pt-1 text-left">
              <div className="space-y-8">
                <FooterNavLink href="#" label="Trending" />
                <FooterNavLink href="/music" label="Music" />
                <FooterNavLink href="#" label="Cinema" />
                <FooterNavLink href="#" label="People" />
                <FooterNavLink href="#" label="Culture" />
              </div>
              <div className="space-y-8">
                <FooterNavLink href="#" label="Mainstage" />
                <FooterNavLink href="#" label="About Us" />
                <FooterNavLink href="#" label="Contact" />
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-white/28 pt-7">
            <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-4 text-center">
              <FooterLegalLink href="#" label="TERMS & CONDITIONS" />
              <FooterLegalLink href="#" label="PRIVACY POLICY" />
              <FooterLegalLink href="#" label="INTELLECTUAL PROPERTY" />
              <FooterLegalLink href="#" label="COOKIES POLICY" />
            </div>
          </div>

          <div className="mt-7 border-t border-white/28 pt-6">
            <p className="text-[15px] font-body font-normal text-white/90">
              © Mainstage - 2026 All right reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-[18px] w-[18px] items-center justify-center text-white/90 transition-colors hover:text-[#CE2127]"
    >
      {children}
    </a>
  );
}

function FooterNavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block text-[18px] font-body font-normal text-white/95 transition-colors hover:text-[#CE2127]"
    >
      {label}
    </a>
  );
}

function FooterLegalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="text-[14px] font-body font-normal text-white/58 transition-colors hover:text-white"
    >
      {label}
    </a>
  );
}
