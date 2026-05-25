import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/login", "/register", "/reset-password", "/verify-email", "/forgot-password"]
      }
    ],
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString()
  };
}
