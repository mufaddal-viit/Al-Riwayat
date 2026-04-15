import type { NextFunction, Request, Response } from "express";

import type { GetCommentsQuery, CommentParamInput, CreateCommentInput } from "./comments.schema";
import * as commentService from "./comments.service";

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * GET /api/comments?slug=:slug
 * Returns approved top-level comments with nested approved replies.
 */
export async function getComments(
  req: Request<Record<string, never>, unknown, unknown, GetCommentsQuery>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { slug } = req.query;
    const comments = await commentService.getApprovedComments(slug);
    res.json({ success: true, data: comments });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/comments
 * Submit a new comment (lands in PENDING, awaiting moderation).
 * Honeypot field silently drops bots.
 */
export async function createComment(
  req: Request<Record<string, never>, unknown, CreateCommentInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Honeypot: if filled, silently succeed without writing to DB
    if (req.body.honeypot) {
      res.status(201).json({ success: true, data: null });
      return;
    }

    const comment = await commentService.createComment(req.body);
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
}

// ─── Admin ────────────────────────────────────────────────────────────────────

/**
 * PATCH /api/admin/comments/:id/approve
 * Set a comment's status to APPROVED, making it visible to readers.
 */
export async function approveComment(
  req: Request<CommentParamInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const comment = await commentService.approveComment(req.params.id);
    res.json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/comments/:id/spam
 * Flag a comment as SPAM. Keeps it in DB for audit; hides from readers.
 */
export async function markAsSpam(
  req: Request<CommentParamInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const comment = await commentService.markAsSpam(req.params.id);
    res.json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/comments/:id
 * Hard-delete a comment and its replies. Irreversible.
 */
export async function deleteComment(
  req: Request<CommentParamInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await commentService.deleteComment(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
