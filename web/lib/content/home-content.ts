export const homeHeroContent = {
  eyebrow: "Issue 1",
  title: "A premium digital magazine for deliberate reading.",
  description:
    "Magazine pairs editorial pacing with a calmer interface: one featured issue, strong hierarchy, and enough breathing room for long-form stories to land.",
  primaryCta: {
    href: "/issue-1",
    label: "Read Issue 1"
  },
  secondaryCta: {
    href: "/about",
    label: "Read More"
  },
  coverImageUrl:
    "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1400/samples/landscapes/girl-urban-view.jpg",
  coverImageAlt:
    "Editorial cover image showing a reader-facing urban portrait composition.",
  metrics: [
    { value: "72ch", label: "reading measure" },
    { value: "375+", label: "mobile-first width" },
    { value: "1 issue", label: "featured focus" }
  ]
} as const;

export const homeAboutPreview = {
  eyebrow: "About The Magazine",
  title: "Editorially paced, digitally native, intentionally restrained.",
  description:
    "The publication is built around a simple promise: digital reading can still feel composed, tactile, and human. Every page favors signal over noise.",
  bullets: [
    "A clear editorial voice anchored by one featured issue at a time.",
    "Readable long-form layouts with softer section transitions and stronger contrast.",
    "A compact navigation system that works on mobile without collapsing the hierarchy."
  ],
  href: "/about",
  label: "Read More"
} as const;
