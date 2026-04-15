"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
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
  const [guestlistEmail, setGuestlistEmail] = useState("");
  const [guestlistState, setGuestlistState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [guestlistMessage, setGuestlistMessage] = useState("");

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

  async function handleGuestlistSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = guestlistEmail.trim().toLowerCase();

    if (!email) {
      setGuestlistState("error");
      setGuestlistMessage("Please enter your email first.");
      return;
    }

    setGuestlistState("loading");
    setGuestlistMessage("");

    try {
      const response = await fetch("/api/guestlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !payload.success) {
        setGuestlistState("error");
        setGuestlistMessage(
          payload.message || "We couldn’t save your email yet. Please try again."
        );
        return;
      }

      setGuestlistState("success");
      setGuestlistMessage(
        payload.message || "Access granted. You’re on the guestlist."
      );
      setGuestlistEmail("");
    } catch {
      setGuestlistState("error");
      setGuestlistMessage("We couldn’t save your email yet. Please try again.");
    }
  }

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
              <p className="text-[16px] font-body font-bold uppercase text-white">
                JOIN THE GUESTLIST
              </p>
              <form
                onSubmit={handleGuestlistSubmit}
                className="mt-4 max-w-[496px]"
              >
                <div className="flex flex-col overflow-hidden border border-[#CE2127] sm:flex-row">
                  <input
                    type="email"
                    value={guestlistEmail}
                    onChange={(event) => {
                      setGuestlistEmail(event.target.value);

                      if (guestlistState !== "idle") {
                        setGuestlistState("idle");
                        setGuestlistMessage("");
                      }
                    }}
                    placeholder="Enter your email ...."
                    className="h-[58px] flex-1 bg-[#3a3a3a] px-4 text-[16px] font-body text-white placeholder:text-white/55 focus:outline-none"
                    aria-label="Join the guestlist with your email"
                    disabled={guestlistState === "loading"}
                  />
                  <button
                    type="submit"
                    className="h-[58px] cursor-pointer bg-[#CE2127] px-8 text-[14px] font-body font-bold uppercase tracking-[0.01em] text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-75"
                    disabled={guestlistState === "loading"}
                  >
                    {guestlistState === "loading" ? "GRANTING ACCESS..." : "GET YOUR ACCESS"}
                  </button>
                </div>

                {guestlistMessage ? (
                  <p
                    className={
                      guestlistState === "success"
                        ? "mt-3 text-[14px] font-body font-semibold text-[#8bffad]"
                        : "mt-3 text-[14px] font-body font-semibold text-[#ffb3b6]"
                    }
                    role="status"
                  >
                    {guestlistMessage}
                  </p>
                ) : null}
              </form>
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
