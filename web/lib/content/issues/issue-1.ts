import { siteConfig } from "@/lib/site";
import { slugify, type IssueContent } from "./types";

const title = "The Quiet Return Of Intentional Reading";

export const issueOne: IssueContent = {
  title,
  issueNumber: 1,
  publishedAt: "2026-03-19T09:00:00.000Z",
  author: "Editorial Desk",
  slug: slugify(title),
  flipbookUrl: "https://heyzine.com/flip-book/7447c8853d.html",
  summary:
    "Issue 01 of *Al-Riwayat* brings together everything that feels like Bohra Gen-Z life - from youth, identity, and traditions to relatable moments and memories. This edition explores topics like the golden phase of youth, what makes Bohra Gen-Z different, things only Bohra Gen-Z will understand, Tafreeh, Mohabbat ni Roti, Waras Mubarak, Hifz journeys, Rida stories, Eid mornings, and much more, capturing the experiences, culture, and moments that shape our generation.",
  coverImageUrl: siteConfig.assets.homeHero,
  coverImageAlt:
    "Issue 1 cover image framed as a premium editorial magazine cover.",
};
