import { publicEnv } from "./public-env";

const fallbackCloud = publicEnv.cloudinaryCloudName || "demo";

export const siteConfig = {
  name: "Al Riwayaat",
  tagline: "A digital magazine for Bohra Gen-Z.",
  description:
    "It is created to share stories, thoughts, memories, and everything in between.",
  footerNote:
    "Built for deliberate reading, quieter browsing, and stories worth staying with.",
  url: "https://magazine.example",
  ogImage: `https://res.cloudinary.com/${fallbackCloud}/image/upload/f_auto,q_auto,w_1600/sample.jpg`,
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
    { href: "https://x.com", label: "X" },
  ],
} as const;
