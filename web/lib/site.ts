import { publicEnv } from "./public-env";

export const siteConfig = {
  name: "Al Riwayaat",
  tagline: "A digital magazine for Bohra Gen-Z.",
  description:
    "It is created to share stories, thoughts, memories, and everything in between.",
  footerNote:
    "Built for deliberate reading, quieter browsing, and stories worth staying with.",
  url: publicEnv.siteUrl,
  assets: {
    logo: "/images/logo.jpg",
    homeHero: "/images/hero/home-hero.webp"
  },
  ogImage: "/images/hero/home-hero.webp",
  navItems: [
    { href: "/", label: "Home" },
    { href: "/about", label: "Our World" },
    { href: "/mission", label: "Mission" },
  ],
  moreItems: [
    { href: "/issue-1", label: "Issue 1" },
    { href: "/about#team", label: "Team" },
    { href: "/mission#values", label: "Values" },
  ],
  socialLinks: [
    { href: "https://www.instagram.com", label: "Instagram" },
    { href: "https://www.linkedin.com", label: "LinkedIn" },
    { href: "https://x.com", label: "X" }
  ]
} as const;
