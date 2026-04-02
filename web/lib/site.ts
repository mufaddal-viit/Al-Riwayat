import { publicEnv } from "./public-env";

const fallbackCloud = publicEnv.cloudinaryCloudName || "demo";

export const siteConfig = {
  name: "Magazine",
  tagline: "A digital magazine for deliberate reading.",
  description:
    "An editorial magazine experience built for long-form reading, careful pacing, and thoughtful independent publishing.",
  url: "https://magazine.example",
  ogImage: `https://res.cloudinary.com/${fallbackCloud}/image/upload/f_auto,q_auto,w_1600/sample.jpg`,
  navItems: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/mission", label: "Mission" }
  ],
  moreItems: [
    { href: "/issue-1", label: "Issue 1" },
    { href: "/about#team", label: "Team" },
    { href: "/mission#values", label: "Values" }
  ],
  socialLinks: [
    { href: "https://www.instagram.com", label: "Instagram" },
    { href: "https://www.linkedin.com", label: "LinkedIn" },
    { href: "https://x.com", label: "X" }
  ]
} as const;
