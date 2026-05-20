export interface IssueContent {
  title: string;
  issueNumber: number;
  publishedAt: string;
  author: string;
  /** URL-safe identifier derived from the title — produced by `slugify(title)`. */
  slug: string;
  flipbookUrl: string;
  summary: string;
  coverImageUrl: string;
  coverImageAlt: string;
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
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
