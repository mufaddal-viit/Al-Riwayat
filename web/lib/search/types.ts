export type SearchDocType = "weekly" | "issue";

/** One searchable item in the prefetched client-side index. */
export interface SearchDoc {
  id: string;
  type: SearchDocType;
  title: string;
  subtitle: string;
  excerpt: string;
  tags: string[];
  href: string;
  /** ISO date used for recency ordering; null when unknown. */
  date: string | null;
}
