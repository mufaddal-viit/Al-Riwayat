import { z } from "zod";

const commentBodySchema = z
  .string()
  .min(1, "Comment cannot be empty.")
  .max(2000, "Comment too long.");

export const createCommentSchema = z.object({
  body: commentBodySchema,
  authorName: z.string().min(1, "Name required.").max(100),
  authorEmail: z.string().email("Valid email required."),
  pageSlug: z.string().min(1, "Page slug required."),
  parentId: z.string().uuid().optional(),
});

export const commentParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CommentParamInput = z.infer<typeof commentParamSchema>;

export const getCommentsQuerySchema = z.object({
  slug: z.string(),
});
