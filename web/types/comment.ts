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

/** Input for creating comment/reply */
export interface CreateCommentInput {
  body: string;
  authorName: string;
  authorEmail: string;
  pageSlug: string;
  parentId?: string;
  honeypot?: string;
}
