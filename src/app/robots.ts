import type { MetadataRoute } from "next";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/backoffice/",
          "/backstage/",
          "/login",
          "/access-denied",
          "/api/",
        ],
      },
    ],
    sitemap: [toAbsoluteUrl("/sitemap.xml"), toAbsoluteUrl("/news-sitemap.xml")],
    host: getSiteUrl(),
  };
}
