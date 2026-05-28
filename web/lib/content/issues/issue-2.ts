import { slugify, type IssueContent } from "./types";

const title = "Rooh Al Akhlak";

export const issueTwo: IssueContent = {
  title,
  issueNumber: 2,
  publishedAt: "2026-05-29T09:00:00.000Z",
  author: "Editorial Desk",
  slug: slugify(title),
  flipbookUrl: "https://heyzine.com/flip-book/30f884cf17.html",
  summary:
    "Issue 02 is bringing a whole new vibe - better aesthetics, fun interactive content, exciting topics, and moments you'll genuinely enjoy. This one has a little bit of everything. Trust us, you're not ready for what's coming.",
  coverImageUrl: "/images/issues/issue2.jpeg",
  coverImageAlt: "Issue 2 cover - Rooh Al Akhlak.",
  comingSoon: false,
};
