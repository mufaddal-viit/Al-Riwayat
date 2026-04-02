import { siteConfig } from "@/lib/site";

export const homeHeroContent = {
  eyebrow: "Issue 1",
  title: "A premium digital magazine created for Bohra Gen-Z  by Bohra Gen-Z.",
  description:
    "It is created to share stories, thoughts, memories, and everything in between. This magazine is about the moments that shape us, the things we relate to, and the voices that deserve to be heard. Whether you’re here to read, reflect, or someday share your own story, we hope you feel a sense of belonging the moment you arrive. Take your time, explore freely, and make yourself at home.",
  primaryCta: {
    href: "/issue-1",
    label: "Read Issue 1",
  },
  secondaryCta: {
    href: "/about",
    label: "Know More of us",
  },
  coverImageUrl: siteConfig.assets.homeHero,
  coverImageAlt:
    "Editorial cover image showing a reader-facing urban portrait composition.",
  metrics: [
    { value: "72ch", label: "reading measure" },
    { value: "375+", label: "mobile-first width" },
    { value: "1 issue", label: "featured focus" },
  ],
} as const;

export const homeAboutPreview = {
  eyebrow: "About The Magazine",
  title: "Editorially paced, digitally native, intentionally restrained.",
  description:
    "The publication is built around a simple promise: digital reading can still feel composed, tactile, and human. Every page favors signal over noise.",
  bullets: [
    "A clear editorial voice anchored by one featured issue at a time.",
    "Readable long-form layouts with softer section transitions and stronger contrast.",
    "A compact navigation system that works on mobile without collapsing the hierarchy.",
  ],
  href: "/about",
  label: "Know More of us",
} as const;
