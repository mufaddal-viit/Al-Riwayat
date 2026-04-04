import { siteConfig } from "@/lib/site";

export const issueOneArticle = {
  title: "The Quiet Return Of Intentional Reading",
  issueNumber: 1,
  publishedAt: "January 15, 2026",
  isoPublishedAt: "2026-01-15T09:00:00.000Z",
  author: "Editorial Desk",
  slug: "issue-1",
  flipbookUrl: "https://heyzine.com/flip-book/7447c8853d.html",
  summary:
    "A long-form editorial opening on why better digital magazines are built through pacing, restraint, and attention-friendly design.",
  coverImageUrl: siteConfig.assets.homeHero,
  coverImageAlt:
    "Issue 1 cover image framed as a premium editorial magazine cover."
} as const;
