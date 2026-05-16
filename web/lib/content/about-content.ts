export const aboutStory = {
  eyebrow: "About Us",
  title: "For readers balancing duniya, deen, and dreams.",
  introduction:
    "Al Riwayat is a digital magazine created for Bohra Gen-Z: a space for stories, creativity, and moments that feel real and relatable.",
  paragraphs: [
    "We started this magazine to create a platform where young voices could exist freely, without labels or expectations. It is about documenting this phase of growing up: the questions we ask, the memories we hold, and the experiences that quietly shape us.",
    "Here, you will find personal stories, reflections, creative writing, culture, and nostalgia, all told through honest perspectives.",
    "Al Riwayat is community-driven. Whether you are here to read, reflect, or someday share your own story, you are always welcome.",
    "This is a space to slow down, connect, and feel seen.",
  ],
  sideNote: "",
  imageUrl: "/images/about/about-story.jpeg",
} as const;

// ─── Mission ──────────────────────────────────────────────────────────────────
// Folded into the About page — there is no standalone /mission route.

export const missionStatement = {
  eyebrow: "Mission",
  title: "To make digital reading feel composed again.",
  description:
    "Magazine exists to publish thoughtfully paced editorial work in an interface that respects the reader's concentration. The mission is not to mimic print, but to restore the conditions that make long-form attention possible online.",
} as const;

export const missionValues = [
  {
    title: "Editorial Restraint",
    description:
      "We prioritize clarity, pacing, and structural calm over visual excess or crowded publishing surfaces.",
  },
  {
    title: "Readable Hierarchy",
    description:
      "Typography, spacing, and image rhythm should make stories easier to scan and easier to stay with.",
  },
  {
    title: "Human Tempo",
    description:
      "The publication is built around deliberate reading habits rather than the constant acceleration of most digital feeds.",
  },
] as const;

export const missionStance = {
  title: "What the magazine stands for",
  paragraphs: [
    "We believe digital publishing is strongest when it stops treating every story like a notification. Readers do not need more motion, more density, or more interruption. They need a clearer sense of entry, orientation, and pace.",
    "That belief shapes the product itself. Each page should feel like part of the same editorial object, from the homepage preview to the long-form reading view and the quieter supporting pages around it.",
  ],
} as const;

export const editorialTeam = [
  {
    name: "Khadija Lakdawala",
    role: "Founder & Editor in Chief",
    bio: "Guides the heart of the magazine, making sure every page has purpose.",
    imageUrl: "/images/team/girl1.jpg",
  },
  {
    name: "Sakina Patel",
    role: "Creative Writer",
    bio: "Brings emotions and ideas to life through thoughtful, relatable writing.",
    imageUrl: "/images/team/girl2.jpg",
  },
  {
    name: "Sarrah Lakdawala",
    role: "Creative Designer",
    bio: "Creates the visual identity of Al Riwayat through layouts, graphics, and aesthetics.",
    imageUrl: "/images/team/girl3.jpg",
  },
  {
    name: "Rabab Jinwala",
    role: "Social Media Lead",
    bio: "Connects Al Riwayat with readers online and helps build the magazine's digital community.",
    imageUrl: "/images/team/girl2.jpg",
  },
  {
    name: "Fatema Vandeliwala",
    role: "Community Engagement",
    bio: "Builds relationships with readers and welcomes new voices into the magazine.",
    imageUrl: "/images/team/girl3.jpg",
  },
] as const;
