import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";

import { AnalyticsLoader } from "@/components/site/analytics-loader";
import { CookieConsent } from "@/components/site/cookie-consent";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { defaultPalette, paletteStorageKey } from "@/lib/palette";
import { siteConfig } from "@/lib/site";

import { AppProviders } from "./providers";
import "./globals.css";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const headingFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-palette={defaultPalette}
    >
      <body
        className={`${bodyFont.variable} ${headingFont.variable} min-h-dvh`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var palette=localStorage.getItem('${paletteStorageKey}');if(palette==='editorial'||palette==='amber'){document.documentElement.dataset.palette=palette;}}catch(e){document.documentElement.dataset.palette='${defaultPalette}';}`
          }}
        />
        <AppProviders>
          <div className="relative flex min-h-dvh flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <CookieConsent />
            <AnalyticsLoader />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
