import { z } from "zod";

// MongoDB ObjectId — 24 hex characters
const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format.");

// ─── Public: submit a comment ─────────────────────────────────────────────────
// No login: author name is in the body (email is no longer collected).
// Replies are not supported — every comment is top-level, scoped to a pageSlug.

export const createCommentSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(80, "Name must be 80 characters or fewer."),
  body: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty.")
    .max(2000, "Comment cannot exceed 2000 characters."),
  pageSlug: z
    .string()
    .min(1, "Page slug is required.")
    .max(200, "Page slug too long."),
  // Honeypot — bots fill this; real users leave it empty
  honeypot: z.string().max(0, "Bot detected.").optional(),
});

// ─── Public: list comments for a page ────────────────────────────────────────

export const getCommentsQuerySchema = z.object({
  slug: z.string().min(1, "Slug is required.").max(200),
});

// ─── Admin: /:id param ────────────────────────────────────────────────────────

export const commentParamSchema = z.object({
  id: objectId,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CommentParamInput  = z.infer<typeof commentParamSchema>;
export type GetCommentsQuery   = z.infer<typeof getCommentsQuerySchema>;
