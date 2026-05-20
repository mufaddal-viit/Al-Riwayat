import { publicEnv } from "./public-env";

export const siteConfig = {
  name: "Al Riwayat",
  tagline: "A digital magazine for Bohra Gen-Z.",
  description:
    "It is created to share stories, thoughts, memories, and everything in between.",
  footerNote:
    "Built for deliberate reading, quieter browsing, and stories worth staying with.",
  contactEmail: "alriwayat53@gmail.com",
  url: publicEnv.siteUrl,
  assets: {
    logo: "/images/logo.jpg",
    homeHero: "/images/hero/home-hero.webp",
  },
  ogImage: "/images/logo.jpg",
  navItems: [
    { href: "/", label: "Home" },
    { href: "/issue/the-quiet-return-of-intentional-reading", label: "Issue 1" },
    { href: "/about", label: "Our World" },
    { href: "/contribute", label: "Contribute" },
  ],
  moreItems: [
    // { href: "/about#team", label: "Team" },
  ],
  socialLinks: [
    {
      href: "https://www.instagram.com/_al_riwayat?igsh=c3l2bjB5YWsyeWh2&utm_source=qr",
      label: "Instagram",
    },
  ],
} as const;
