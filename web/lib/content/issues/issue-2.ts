import { siteConfig } from "@/lib/site";
import type { IssueContent } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// LAUNCH-DAY CHECKLIST (edit these four fields from GitHub mobile on 29 May):
//   1. flipbookUrl    →  paste the Heyzine flipbook URL
//   2. comingSoon     →  change `true` to `false`
//   3. summary        →  optional: replace placeholder with the real summary
//   4. coverImageUrl  →  optional: swap for a real Issue 2 cover URL
// Everything else (title, slug, date, author) is final.
// ─────────────────────────────────────────────────────────────────────────────

export const issueTwo: IssueContent = {
  title: "Rooh Al Akhlak",
  issueNumber: 2,
  publishedAt: "2026-05-29T09:00:00.000Z",
  author: "Editorial Desk",
  // Slug is hardcoded (not derived from title) so the URL stays stable even if
  // the displayed title is tweaked later.
  slug: "rooh-al-akhlak",
  flipbookUrl: "",
  summary:
    "Issue 02 is bringing a whole new vibe — better aesthetics, fun interactive content, exciting topics, and moments you’ll genuinely enjoy. This one has a little bit of everything. Trust us, you’re not ready for what’s coming.",
  coverImageUrl: siteConfig.assets.homeHero,
  coverImageAlt: "Issue 2 cover — Rooh Al Akhlak.",
  comingSoon: true,
};
