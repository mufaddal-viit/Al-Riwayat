import { Router } from "express";

import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { commentRateLimiter } from "../../middleware/rateLimiter";
import {
  createCommentSchema,
  getCommentsQuerySchema,
  commentParamSchema,
} from "./comments.schema";
import {
  getComments,
  createComment,
  approveComment,
  markAsSpam,
  deleteComment,
} from "./comments.controller";

// ─── Public router (/api/comments) ───────────────────────────────────────────

export const commentsPublicRouter = Router();

/** GET /api/comments?slug=:slug  — list approved comments */
commentsPublicRouter.get(
  "/",
  validate(getCommentsQuerySchema, "query"),
  getComments,
);

/** POST /api/comments  — submit new comment (auth required) */
commentsPublicRouter.post(
  "/",
  requireAuth,
  commentRateLimiter,
  validate(createCommentSchema),
  createComment,
);

// ─── Admin router (/api/admin/comments) ───────────────────────────────────────
// All routes below require a valid access token AND the ADMIN role.

export const commentsAdminRouter = Router();

commentsAdminRouter.use(requireAuth, requireRole("ADMIN"));

/** PATCH /api/admin/comments/:id/approve  — publish a pending comment */
commentsAdminRouter.patch(
  "/:id/approve",
  validate(commentParamSchema, "params"),
  approveComment,
);

/** PATCH /api/admin/comments/:id/spam  — flag as spam (soft-reject) */
commentsAdminRouter.patch(
  "/:id/spam",
  validate(commentParamSchema, "params"),
  markAsSpam,
);

/** DELETE /api/admin/comments/:id  — hard-delete comment + its replies */
commentsAdminRouter.delete(
  "/:id",
  validate(commentParamSchema, "params"),
  deleteComment,
);
