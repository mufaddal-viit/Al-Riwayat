/** Frontend Comment type from API */
export interface Comment {
  id: string;
  body: string;
  authorName: string;
  pageSlug: string;
  status: "PENDING" | "APPROVED" | "SPAM";
  createdAt: string;
}

/** Input for creating a comment. No login — author identity is in the body. */
export interface CreateCommentInput {
  authorName: string;
  body: string;
  pageSlug: string;
  honeypot?: string;
}
