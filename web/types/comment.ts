/** Frontend Comment type from API */
export interface Comment {
  id: string;
  body: string;
  authorName: string;
  authorEmail: string;
  pageSlug: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  replies: Comment[];
}

/** Input for creating comment/reply. Author info is sourced from auth. */
export interface CreateCommentInput {
  body: string;
  pageSlug: string;
  parentId?: string;
  honeypot?: string;
}
