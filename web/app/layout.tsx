import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";

import { AnalyticsLoader } from "@/components/site/analytics-loader";
import { CookieConsent } from "@/components/site/cookie-consent";
import { EngagementModal } from "@/components/engagement/engagement-modal";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { consentStorageKey, defaultConsent } from "@/lib/consent";
import { siteConfig } from "@/lib/site";

import { AppProviders } from "./providers";
import "./globals.css";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const headingFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const ogImageUrl = new URL(siteConfig.ogImage, siteConfig.url).toString();

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: siteConfig.authors.map((a) => ({ name: a.name })),
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  category: "magazine",
  alternates: {
    canonical: siteConfig.url,
  },
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
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: siteConfig.assets.favicon, sizes: "any" },
      { url: siteConfig.assets.icon192, type: "image/png", sizes: "192x192" },
      { url: siteConfig.assets.icon512, type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: siteConfig.assets.appleTouchIcon, sizes: "180x180", type: "image/png" },
    ],
    shortcut: [siteConfig.assets.favicon],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: ogImageUrl,
        width: siteConfig.ogImageWidth,
        height: siteConfig.ogImageHeight,
        alt: siteConfig.ogImageAlt,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitterSite,
    creator: siteConfig.twitterCreator,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [{ url: ogImageUrl, alt: siteConfig.ogImageAlt }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: siteConfig.themeColor.dark },
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  alternateName: siteConfig.tagline,
  url: siteConfig.url,
  description: siteConfig.description,
  inLanguage: "en",
  publisher: {
    "@type": "Organization",
    name: siteConfig.publisher,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: new URL(siteConfig.assets.logo, siteConfig.url).toString(),
    },
  },
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteConfig.url}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: new URL(siteConfig.assets.logo, siteConfig.url).toString(),
  sameAs: siteConfig.socialLinks.map((link) => link.href),
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-consent={defaultConsent}
    >
      <body
        className={`${bodyFont.variable} ${headingFont.variable} min-h-dvh`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement;var consent=localStorage.getItem('${consentStorageKey}');if(consent==='accepted'||consent==='declined'){d.dataset.consent=consent;}}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <AppProviders>
          <div className="relative flex min-h-dvh flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <CookieConsent />
            <AnalyticsLoader />
            <EngagementModal />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
