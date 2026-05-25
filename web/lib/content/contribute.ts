export type GuidelineItem = {
  id: string;
  title: string;
  description: string;
};

export const contributeIntro = {
  eyebrow: "Contribute",
  title1: "Turn your Thoughts into Stories",
  title2: "Share Your Story with Al Riwayat",
  heroText: "Let you inner voice penned down, but follow the guideline below",
  description:
    "Al Riwayat is built on community and shared stories. We welcome submissions from Bohra youth who want to express their thoughts, experiences, creativity, or reflections in their own voice. Whether it's a personal story, a short reflection, poetry, or something in between, your perspective matters. If you've been meaning to tell a story, this is your space to share it.",
} as const;

export const submissionGuidelines: readonly GuidelineItem[] = [
  {
    id: "guideline-1",
    title: "Original Work",
    description:
      "Submissions should be original and written in your own voice.",
  },
  {
    id: "guideline-2",
    title: "What to Submit",
    description:
      "You can submit personal stories, reflections, poetry, or short pieces.",
  },
  {
    id: "guideline-3",
    title: "No Word Limit",
    description:
      "There's no strict word limit — clarity and honesty matter more.",
  },
  {
    id: "guideline-4",
    title: "Light Editing",
    description: "Submissions may be edited lightly for clarity and length.",
  },
  {
    id: "guideline-5",
    title: "Permissions",
    description:
      "By submitting, you give Al Riwayat permission to publish your work digitally.",
  },
  {
    id: "guideline-6",
    title: "Credit",
    description:
      "Contributors will be credited, unless anonymity is requested.",
  },
] as const;

export const contributeCTA = {
  message:
    "Share your story with us using the form below. Submissions are always open.",
} as const;
