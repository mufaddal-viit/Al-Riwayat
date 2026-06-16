export const contributionCategories = [
  "Story",
  "Poetry",
  "Reflection",
  "Art",
] as const;

export type ContributionCategory = (typeof contributionCategories)[number];

export const contributionStatuses = ["draft", "published", "archived"] as const;

export type ContributionStatus = (typeof contributionStatuses)[number];
