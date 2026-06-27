export const contributionCategories = [
  "Story",
  "Poetry",
  "Reflection",
  "Art",
] as const;

export type ContributionCategory = (typeof contributionCategories)[number];

/**
 * Moderation lifecycle for visitor submissions:
 *   pending   — awaiting admin review (default on submit)
 *   published — live on the public /contributions page
 *   rejected  — soft-hidden, retained for record
 */
export const contributionStatuses = [
  "pending",
  "published",
  "rejected",
] as const;

export type ContributionStatus = (typeof contributionStatuses)[number];
