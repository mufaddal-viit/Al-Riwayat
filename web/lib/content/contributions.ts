import type { Contribution, ContributionCategory } from "@/types/api";

/**
 * Placeholder contributions used as a graceful fallback when the
 * `/contributions` API is unavailable (e.g. local dev before the backend
 * ships). Mirrors the local-content fallback pattern used by issues.
 */
export const placeholderContributions: Contribution[] = [
  {
    id: "placeholder-1",
    slug: "the-morning-i-stopped-rushing",
    title: "The Morning I Stopped Rushing",
    author: "Fatema A.",
    category: "Reflection",
    publishedAt: "2026-05-02T09:00:00.000Z",
    excerpt:
      "I used to think slowing down was something I'd earn later. One ordinary Tuesday taught me otherwise.",
    body: "I used to think slowing down was something I'd earn later — after the exams, after the move, after the long list of laters finally ran out.\n\nThen one ordinary Tuesday I missed my bus by a minute. I stood at the empty stop and, for the first time in weeks, simply watched the street wake up. The chai stall lifting its shutter. An old man feeding pigeons like it was the most important task of his day.\n\nNothing happened. And somehow, everything did. I have been chasing that minute ever since.",
    coverImageUrl: "/images/hero/home-hero.webp",
    coverImageAlt: "A quiet morning street scene.",
    featured: true,
  },
  {
    id: "placeholder-2",
    slug: "letters-to-a-younger-me",
    title: "Letters to a Younger Me",
    author: "Anonymous",
    category: "Poetry",
    publishedAt: "2026-04-18T09:00:00.000Z",
    excerpt:
      "A short verse for the version of myself that was certain the world would end at sixteen.",
    body: "Dear smaller hands,\nyou will not always grip so tightly.\n\nThe things you fear forgetting\nare already woven into the way you laugh.\n\nBe patient with the slow arithmetic of growing —\nyou are not late.\nYou were never late.",
  },
  {
    id: "placeholder-3",
    slug: "the-recipe-my-grandmother-never-wrote-down",
    title: "The Recipe My Grandmother Never Wrote Down",
    author: "Hussain M.",
    category: "Story",
    publishedAt: "2026-03-30T09:00:00.000Z",
    excerpt:
      "She measured in handfuls and memory. Now I'm trying to write down what she carried only in her hands.",
    body: "She measured in handfuls and in memory — a pinch of this, a feeling of that, the rest decided by the smell rising off the pan.\n\nWhen I asked her for the recipe, she laughed and said the recipe was simply paying attention. I didn't understand then. Now, standing in my own kitchen, trying to recreate a taste I can't quite name, I think I finally do.\n\nThis is my attempt to write down what she carried only in her hands.",
    coverImageUrl: "/images/hero/home-hero.webp",
    coverImageAlt: "A kitchen scene with traditional cooking.",
  },
];

const categoryOrder: ContributionCategory[] = [
  "Story",
  "Poetry",
  "Reflection",
  "Art",
];

/** Returns the distinct categories present in a set of contributions, in a stable display order. */
export function listContributionCategories(
  contributions: Contribution[],
): ContributionCategory[] {
  const present = new Set(contributions.map((c) => c.category));
  return categoryOrder.filter((category) => present.has(category));
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function formatContributionDate(publishedAt: string): string {
  return dateFormatter.format(new Date(publishedAt));
}

/** Newest first. */
export function sortContributions(contributions: Contribution[]): Contribution[] {
  return [...contributions].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}
