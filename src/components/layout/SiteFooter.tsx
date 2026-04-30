"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FALLBACK_SITE_SETTINGS,
  type SiteSettings,
} from "@/lib/site-settings";

type SiteFooterProps = {
  siteSettings?: SiteSettings;
};

export default function SiteFooter({
  siteSettings,
}: SiteFooterProps) {
  const [resolvedSettings, setResolvedSettings] = useState<SiteSettings>(
    siteSettings ?? FALLBACK_SITE_SETTINGS
  );

  useEffect(() => {
    let isActive = true;

    async function loadSiteSettings() {
      try {
        const response = await fetch("/api/site-settings", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const nextSettings = (await response.json()) as SiteSettings;

        if (isActive) {
          setResolvedSettings(nextSettings);
        }
      } catch {
        // Keep the current footer settings if the refresh request fails.
      }
    }

    loadSiteSettings();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <footer className="mt-auto bg-[#161616] text-white">
      <div className="mx-auto max-w-[1116px] px-4 py-14 md:px-6 md:py-16">
        <div className="grid grid-cols-1 gap-14 xl:grid-cols-[minmax(0,1fr)_262px]">
          <div className="max-w-[530px]">
            <img
              src="/mainstage-logo.png"
              alt="Mainstage"
              className="w-[170px]"
            />

            <p className="mt-2 text-[15px] font-body font-normal leading-none text-white/90">
              {resolvedSettings.footerTagline}
            </p>

            <div className="mt-10">
              <p className="text-[16px] font-body font-bold uppercase text-white">
                FOLLOW US
              </p>
              <div className="mt-4 flex items-center gap-4">
                <SocialIcon href={resolvedSettings.instagramUrl} label="Instagram">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4.2" />
                    <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </SocialIcon>
                <SocialIcon href={resolvedSettings.youtubeUrl} label="YouTube">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth="1.8">
                    <rect x="3" y="6.5" width="18" height="11" rx="3.2" />
                    <path d="M10 9.6 15.5 12 10 14.4Z" fill="currentColor" stroke="none" />
                  </svg>
                </SocialIcon>
                <SocialIcon href={resolvedSettings.tiktokUrl} label="TikTok">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-[18px] w-[18px] fill-none stroke-current"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 4c.5 1.9 1.8 3.7 4 4.5" />
                    <path d="M10 10.4v5.8a3.2 3.2 0 1 1-2.6-3.1" />
                    <path d="M14 4v8.5" />
                    <path d="M14 8.2c1.2.8 2.7 1.3 4 1.3" />
                  </svg>
                </SocialIcon>
              </div>
            </div>

            <div className="mt-10">
              <Link
                href="/guestlist"
                className="inline-block text-[16px] font-body font-bold uppercase text-white transition-colors hover:text-[#CE2127]"
              >
                JOIN THE GUESTLIST
              </Link>
              <p className="mt-4 max-w-[496px] text-[15px] font-body leading-[1.6] text-white/70">
                Sign up from the dedicated guestlist page and get direct access
                to what is moving behind the scenes.
              </p>
              <Link
                href="/guestlist"
                className="mt-4 inline-flex h-[58px] items-center justify-center bg-[#CE2127] px-8 text-[14px] font-body font-bold uppercase tracking-[0.01em] text-white transition-opacity hover:opacity-90"
              >
                Get your access
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-14 gap-y-6 pt-1 text-left">
            <div className="space-y-8">
              <FooterNavLink href="/trending" label="Trending" />
              <FooterNavLink href="/music" label="Music" />
              <FooterNavLink href="/cinema" label="Cinema" />
              <FooterNavLink href="/people" label="People" />
              <FooterNavLink href="/sport" label="Sport" />
              <FooterNavLink href="/events" label="Events" />
              <FooterNavLink href="/culture" label="Culture" />
            </div>
            <div className="space-y-8">
              <FooterNavLink href="/backstage" label="Backstage" />
              <FooterNavLink href="/about" label="About Us" />
              <FooterNavLink href="/contact" label="Contact" />
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/28 pt-7">
          <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-4 text-center">
            {resolvedSettings.legalLinks.map((link) => (
              <FooterLegalLink key={`${link.label}-${link.href}`} href={link.href} label={link.label} />
            ))}
          </div>
        </div>

        <div className="mt-7 border-t border-white/28 pt-6">
          <p className="text-[15px] font-body font-normal text-white/90">
            {resolvedSettings.copyrightText}
          </p>
        </div>
      </div>
    </footer>
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
      className="flex h-[18px] w-[18px] cursor-pointer items-center justify-center text-white/90 transition-colors hover:text-[#CE2127]"
    >
      {children}
    </a>
  );
}

function FooterNavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block cursor-pointer text-[18px] font-body font-normal text-white/95 transition-colors hover:text-[#CE2127]"
    >
      {label}
    </a>
  );
}

function FooterLegalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="cursor-pointer text-[14px] font-body font-normal text-white/58 transition-colors hover:text-white"
    >
      {label}
    </a>
  );
}
