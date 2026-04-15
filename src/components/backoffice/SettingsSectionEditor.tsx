import { updateSiteSettingsAction } from "@/app/backoffice/settings/actions";
import type { SiteSettings } from "@/lib/site-settings";

type SettingsSection =
  | "about"
  | "contact"
  | "social"
  | "footer"
  | "legal"
  | "legal-pages";

function sectionTarget(section: SettingsSection) {
  return `settings:${section}`;
}

export default function SettingsSectionEditor({
  section,
  siteSettings,
}: {
  section: SettingsSection;
  siteSettings: SiteSettings;
}) {
  const legalLinks = Array.isArray(siteSettings.legalLinks)
    ? siteSettings.legalLinks
    : [];
  const legalLink1 = legalLinks[0] ?? { label: "", href: "" };
  const legalLink2 = legalLinks[1] ?? { label: "", href: "" };
  const legalLink3 = legalLinks[2] ?? { label: "", href: "" };
  const legalLink4 = legalLinks[3] ?? { label: "", href: "" };
  const legalTerms = siteSettings.legalPages.terms;
  const legalPrivacy = siteSettings.legalPages.privacy;
  const legalIntellectual = siteSettings.legalPages.intellectual;
  const legalCookies = siteSettings.legalPages.cookies;
  const aboutCoverageItems = Array.isArray(siteSettings.aboutPage.coverageItems)
    ? siteSettings.aboutPage.coverageItems
    : [];

  if (section === "about") {
    return (
      <form action={updateSiteSettingsAction}>
        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            About Us
          </p>
          <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Update the About page
          </h2>
          <input type="hidden" name="section" value="about" />
          <input type="hidden" name="redirect_target" value={sectionTarget(section)} />

          <div className="mt-5 grid grid-cols-1 gap-4">
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Page title
              </span>
              <input
                name="about_title"
                defaultValue={siteSettings.aboutPage.title}
                className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
              />
            </label>

            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Intro content
              </span>
              <textarea
                name="about_intro_content"
                defaultValue={siteSettings.aboutPage.introContent}
                rows={12}
                className="mt-2 w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 py-4 outline-none focus:border-[#CE2127]"
              />
            </label>

            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Signature line
              </span>
              <input
                name="about_signature"
                defaultValue={siteSettings.aboutPage.signature}
                className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
              />
            </label>

            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Coverage section title
              </span>
              <input
                name="about_coverage_title"
                defaultValue={siteSettings.aboutPage.coverageTitle}
                className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
              />
            </label>

            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Coverage section subtitle
              </span>
              <textarea
                name="about_coverage_subtitle"
                defaultValue={siteSettings.aboutPage.coverageSubtitle}
                rows={3}
                className="mt-2 w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 py-4 outline-none focus:border-[#CE2127]"
              />
            </label>

            <div className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-5">
              <p className="text-[13px] font-body font-medium text-black/60">
                Coverage cards
              </p>
              <p className="mt-1 text-[13px] font-body leading-[1.7] text-black/45">
                Update the six visuals shown in the &quot;What we cover?&quot; section.
              </p>

              <div className="mt-4 space-y-5">
                {Array.from({ length: 6 }, (_, index) => {
                  const item = aboutCoverageItems[index] ?? {
                    title: "",
                    description: "",
                    image: "",
                  };

                  return (
                    <div
                      key={`about-coverage-item-${index + 1}`}
                      className="rounded-[14px] border border-black/8 bg-white p-4"
                    >
                      <p className="text-[12px] font-body font-semibold uppercase tracking-[0.14em] text-[#CE2127]">
                        Card {index + 1}
                      </p>

                      <div className="mt-3 grid grid-cols-1 gap-4">
                        <label className="block">
                          <span className="text-[13px] font-body font-medium text-black/60">
                            Title
                          </span>
                          <input
                            name={`about_coverage_item_title_${index + 1}`}
                            defaultValue={item.title}
                            className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                          />
                        </label>

                        <label className="block">
                          <span className="text-[13px] font-body font-medium text-black/60">
                            Description
                          </span>
                          <textarea
                            name={`about_coverage_item_description_${index + 1}`}
                            defaultValue={item.description}
                            rows={3}
                            className="mt-2 w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 py-4 outline-none focus:border-[#CE2127]"
                          />
                        </label>

                        <label className="block">
                          <span className="text-[13px] font-body font-medium text-black/60">
                            Image URL
                          </span>
                          <input
                            name={`about_coverage_item_image_${index + 1}`}
                            defaultValue={item.image}
                            className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                            placeholder="https://..."
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-5 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save About Us settings
          </button>
        </div>
      </form>
    );
  }

  if (section === "contact") {
    return (
      <form action={updateSiteSettingsAction}>
        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Contact
          </p>
          <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Set the main contact email
          </h2>
          <input type="hidden" name="section" value="contact" />
          <input type="hidden" name="redirect_target" value={sectionTarget(section)} />
          <label className="mt-5 block">
            <span className="text-[13px] font-body font-medium text-black/60">
              Contact email
            </span>
            <input
              name="contact_email"
              type="email"
              defaultValue={siteSettings.contactEmail}
              className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
              placeholder="contact@themainstagent.com"
            />
          </label>
          <button
            type="submit"
            className="mt-5 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save contact settings
          </button>
        </div>
      </form>
    );
  }

  if (section === "social") {
    return (
      <form action={updateSiteSettingsAction}>
        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Social
          </p>
          <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Update footer social links
          </h2>
          <input type="hidden" name="section" value="social" />
          <input type="hidden" name="redirect_target" value={sectionTarget(section)} />
          <div className="mt-5 grid grid-cols-1 gap-4">
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Instagram URL
              </span>
              <input
                name="instagram_url"
                type="url"
                defaultValue={siteSettings.instagramUrl}
                className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="https://instagram.com/..."
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                YouTube URL
              </span>
              <input
                name="youtube_url"
                type="url"
                defaultValue={siteSettings.youtubeUrl}
                className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="https://youtube.com/..."
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                TikTok URL
              </span>
              <input
                name="tiktok_url"
                type="url"
                defaultValue={siteSettings.tiktokUrl}
                className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="https://tiktok.com/@..."
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-5 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save social links
          </button>
        </div>
      </form>
    );
  }

  if (section === "footer") {
    return (
      <form action={updateSiteSettingsAction}>
        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Footer
          </p>
          <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Keep the footer wording aligned
          </h2>
          <input type="hidden" name="section" value="footer" />
          <input type="hidden" name="redirect_target" value={sectionTarget(section)} />
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Footer tagline
              </span>
              <input
                name="footer_tagline"
                defaultValue={siteSettings.footerTagline}
                className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="For the Culture. For the Industry."
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-body font-medium text-black/60">
                Copyright line
              </span>
              <input
                name="copyright_text"
                defaultValue={siteSettings.copyrightText}
                className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]"
                placeholder="© Mainstage - 2026 All right reserved"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-5 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save footer settings
          </button>
        </div>
      </form>
    );
  }

  if (section === "legal") {
    return (
      <form action={updateSiteSettingsAction}>
        <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
            Legal
          </p>
          <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
            Update the footer legal links
          </h2>
          <input type="hidden" name="section" value="legal" />
          <input type="hidden" name="redirect_target" value={sectionTarget(section)} />
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">
                  Legal label 1
                </span>
                <input name="legal_label_1" defaultValue={legalLink1.label} className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]" />
              </label>
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">
                  Legal destination 1
                </span>
                <input name="legal_href_1" defaultValue={legalLink1.href} className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]" />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">
                  Legal label 2
                </span>
                <input name="legal_label_2" defaultValue={legalLink2.label} className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]" />
              </label>
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">
                  Legal destination 2
                </span>
                <input name="legal_href_2" defaultValue={legalLink2.href} className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]" />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">
                  Legal label 3
                </span>
                <input name="legal_label_3" defaultValue={legalLink3.label} className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]" />
              </label>
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">
                  Legal destination 3
                </span>
                <input name="legal_href_3" defaultValue={legalLink3.href} className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]" />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">
                  Legal label 4
                </span>
                <input name="legal_label_4" defaultValue={legalLink4.label} className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]" />
              </label>
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">
                  Legal destination 4
                </span>
                <input name="legal_href_4" defaultValue={legalLink4.href} className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-[#faf8f6] px-4 outline-none focus:border-[#CE2127]" />
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="mt-5 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save legal links
          </button>
        </div>
      </form>
    );
  }

  return (
    <form action={updateSiteSettingsAction}>
      <div className="rounded-[20px] border border-black/8 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
        <p className="text-[12px] font-body font-semibold uppercase tracking-[0.16em] text-[#CE2127]">
          Legal pages
        </p>
        <h2 className="mt-3 text-[24px] font-body font-bold tracking-[-0.04em] text-[#181818]">
          Edit the content of each legal page
        </h2>
        <p className="mt-2 max-w-[760px] text-[14px] font-body leading-[1.7] text-black/60">
          Update the page title, effective date, and body copy here. Use blank lines to separate paragraphs and start a line with <span className="font-semibold">- </span> if you want a bullet list.
        </p>
        <input type="hidden" name="section" value="legal_pages" />
        <input type="hidden" name="redirect_target" value={sectionTarget(section)} />

        <div className="mt-6 space-y-6">
          <div className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-5">
            <h3 className="text-[18px] font-body font-bold text-[#181818]">Terms & Conditions</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">Page title</span>
                <input name="terms_title" defaultValue={legalTerms.title} className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]" />
              </label>
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">Effective date</span>
                <input name="terms_effective_date" defaultValue={legalTerms.effectiveDate} className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]" placeholder="04/02/2026" />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="text-[13px] font-body font-medium text-black/60">Page content</span>
              <textarea name="terms_content" defaultValue={legalTerms.content} className="mt-2 min-h-[260px] w-full rounded-[12px] border border-black/10 bg-white px-4 py-4 outline-none focus:border-[#CE2127]" />
            </label>
          </div>

          <div className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-5">
            <h3 className="text-[18px] font-body font-bold text-[#181818]">Privacy Policy</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">Page title</span>
                <input name="privacy_title" defaultValue={legalPrivacy.title} className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]" />
              </label>
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">Effective date</span>
                <input name="privacy_effective_date" defaultValue={legalPrivacy.effectiveDate} className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]" placeholder="04/02/2026" />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="text-[13px] font-body font-medium text-black/60">Page content</span>
              <textarea name="privacy_content" defaultValue={legalPrivacy.content} className="mt-2 min-h-[260px] w-full rounded-[12px] border border-black/10 bg-white px-4 py-4 outline-none focus:border-[#CE2127]" />
            </label>
          </div>

          <div className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-5">
            <h3 className="text-[18px] font-body font-bold text-[#181818]">Intellectual Property</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">Page title</span>
                <input name="intellectual_title" defaultValue={legalIntellectual.title} className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]" />
              </label>
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">Effective date</span>
                <input name="intellectual_effective_date" defaultValue={legalIntellectual.effectiveDate} className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]" placeholder="Optional" />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="text-[13px] font-body font-medium text-black/60">Page content</span>
              <textarea name="intellectual_content" defaultValue={legalIntellectual.content} className="mt-2 min-h-[220px] w-full rounded-[12px] border border-black/10 bg-white px-4 py-4 outline-none focus:border-[#CE2127]" />
            </label>
          </div>

          <div className="rounded-[16px] border border-black/8 bg-[#faf8f6] p-5">
            <h3 className="text-[18px] font-body font-bold text-[#181818]">Cookies Privacy</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">Page title</span>
                <input name="cookies_title" defaultValue={legalCookies.title} className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]" />
              </label>
              <label className="block">
                <span className="text-[13px] font-body font-medium text-black/60">Effective date</span>
                <input name="cookies_effective_date" defaultValue={legalCookies.effectiveDate} className="mt-2 h-[50px] w-full rounded-[12px] border border-black/10 bg-white px-4 outline-none focus:border-[#CE2127]" placeholder="04/02/2026" />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="text-[13px] font-body font-medium text-black/60">Page content</span>
              <textarea name="cookies_content" defaultValue={legalCookies.content} className="mt-2 min-h-[260px] w-full rounded-[12px] border border-black/10 bg-white px-4 py-4 outline-none focus:border-[#CE2127]" />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90"
        >
          Save legal page content
        </button>
      </div>
    </form>
  );
}
