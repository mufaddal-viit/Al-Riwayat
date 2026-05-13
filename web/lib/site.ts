import { publicEnv } from "./public-env";

export const siteConfig = {
  name: "Al Riwayat",
  tagline: "A digital magazine for Bohra Gen-Z.",
  description:
    "It is created to share stories, thoughts, memories, and everything in between.",
  footerNote:
    "Built for deliberate reading, quieter browsing, and stories worth staying with.",
  url: publicEnv.siteUrl,
  locale: "en_US",
  keywords: [
    "Al Riwayat",
    "digital magazine",
    "Bohra Gen-Z",
    "long-form reading",
    "editorial",
    "stories",
  ],
  authors: [{ name: "Al Riwayat Editorial Desk" }],
  creator: "Al Riwayat",
  publisher: "Al Riwayat",
  themeColor: {
    light: "#fffaf3",
    dark: "#0d0d0d",
  },
  assets: {
    logo: "/images/logo.jpg",
    homeHero: "/images/hero/home-hero.webp",
    favicon: "/images/favicon.ico",
    appleTouchIcon: "/images/icons/apple-touch-icon.png",
    icon192: "/images/icons/icon-192.png",
    icon512: "/images/icons/icon-512.png",
    iconMaskable: "/images/icons/icon-512-maskable.png",
  },
  // Recommended size: 1200x630 (1.91:1) — used as default for OG + Twitter cards.
  ogImage: "/images/og/og-default.png",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: "Al Riwayat — a digital magazine for Bohra Gen-Z.",
  // Replace with the real X/Twitter handles when available.
  twitterSite: "@alriwayat",
  twitterCreator: "@alriwayat",
  navItems: [
    { href: "/", label: "Home" },
    { href: "/issue-1", label: "Issue 1" },
    { href: "/about", label: "Our World" },
    { href: "/mission", label: "Mission" },
    { href: "/contribute", label: "Contribute" },
  ],
  moreItems: [
    // { href: "/about#team", label: "Team" },
    // { href: "/mission#values", label: "Values" },
  ],
  socialLinks: [
    { href: "https://www.instagram.com", label: "Instagram" },
    { href: "https://www.linkedin.com", label: "LinkedIn" },
    { href: "https://x.com", label: "X" },
  ],
} as const;
