import { z } from "zod";

// MongoDB ObjectId — 24 hex characters
const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format.");

// ─── Public: submit a comment ─────────────────────────────────────────────────
// Author info comes from the authenticated session, not the request body.
// parentId accepts either a MongoDB ObjectId (prisma) or a Firestore doc id.

export const createCommentSchema = z.object({
  body: z
    .string()
    .min(1, "Comment cannot be empty.")
    .max(2000, "Comment cannot exceed 2000 characters."),
  pageSlug: z
    .string()
    .min(1, "Page slug is required.")
    .max(200, "Page slug too long."),
  parentId: z.string().min(1).max(64).optional(),
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
