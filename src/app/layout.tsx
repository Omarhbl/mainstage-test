import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import AppChrome from "@/components/layout/AppChrome";
import JsonLd from "@/components/seo/JsonLd";
import { GoogleAnalytics } from "@next/third-parties/google";
import {
  buildKeywordList,
  buildOrganizationSchema,
  buildWebsiteSchema,
  getDefaultOgImage,
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TITLE,
} from "@/lib/seo";
import { getHomepageSettings } from "@/lib/supabase/server";

const heebo = Heebo({
  subsets: ["latin"],
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  keywords: buildKeywordList(),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? {
        google: process.env.GOOGLE_SITE_VERIFICATION,
      }
    : undefined,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: "website",
    url: "/",
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    images: [
      {
        url: getDefaultOgImage(),
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [getDefaultOgImage()],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const homepageSettings = await getHomepageSettings();
  const rootStructuredData = [buildOrganizationSchema(), buildWebsiteSchema()];

  return (
    <html
      lang="en"
      className={`${heebo.variable} h-full !scroll-smooth`}
    >
      <body className="bg-void text-text-primary font-body selection:bg-primary/30 flex flex-col min-h-screen">
        <JsonLd data={rootStructuredData} />
        <div className="noise-overlay" />
        <AppChrome tickerItems={homepageSettings.tickerItems}>{children}</AppChrome>
          <GoogleAnalytics gaId="G-5REKDL0CNK" />
      </body>
    </html>
  );
}
