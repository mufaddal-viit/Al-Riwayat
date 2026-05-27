export interface IssueContent {
  title: string;
  issueNumber: number;
  publishedAt: string;
  author: string;
  /** URL-safe identifier used in the public /issue/[slug] path. */
  slug: string;
  flipbookUrl: string;
  summary: string;
  coverImageUrl: string;
  coverImageAlt: string;
  /** When true, the page renders a "Coming Soon" teaser instead of the flipbook. */
  comingSoon?: boolean;
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const issueDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function formatIssuePublishedAt(publishedAt: string) {
  return issueDateFormatter.format(new Date(publishedAt));
}
