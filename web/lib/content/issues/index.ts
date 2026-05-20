import type { IssueContent } from "./types";
import { issueOne } from "./issue-1";

export type { IssueContent } from "./types";
export { formatIssuePublishedAt } from "./types";

const issues: IssueContent[] = [issueOne];

const issuesBySlug = new Map(issues.map((issue) => [issue.slug, issue]));

export function getIssueBySlug(slug: string): IssueContent | undefined {
  return issuesBySlug.get(slug);
}

export function listIssueSlugs(): string[] {
  return issues.map((issue) => issue.slug);
}

export function listIssues(): IssueContent[] {
  return issues;
}
