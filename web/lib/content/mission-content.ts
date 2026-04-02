export const missionStatement = {
  eyebrow: "Mission",
  title: "To make digital reading feel composed again.",
  description:
    "Magazine exists to publish thoughtfully paced editorial work in an interface that respects the reader's concentration. The mission is not to mimic print, but to restore the conditions that make long-form attention possible online."
} as const;

export const missionValues = [
  {
    title: "Editorial Restraint",
    description:
      "We prioritize clarity, pacing, and structural calm over visual excess or crowded publishing surfaces."
  },
  {
    title: "Readable Hierarchy",
    description:
      "Typography, spacing, and image rhythm should make stories easier to scan and easier to stay with."
  },
  {
    title: "Human Tempo",
    description:
      "The publication is built around deliberate reading habits rather than the constant acceleration of most digital feeds."
  }
] as const;

export const missionStance = {
  title: "What the magazine stands for",
  paragraphs: [
    "We believe digital publishing is strongest when it stops treating every story like a notification. Readers do not need more motion, more density, or more interruption. They need a clearer sense of entry, orientation, and pace.",
    "That belief shapes the product itself. Each page should feel like part of the same editorial object, from the homepage preview to the long-form reading view and the quieter supporting pages around it."
  ]
} as const;
