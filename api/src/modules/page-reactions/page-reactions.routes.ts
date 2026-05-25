import { Router } from "express";

import { validate } from "../../middleware/validate";
import { pageReactionRateLimiter } from "../../middleware/rateLimiter";
import {
  setReactionSchema,
  clearReactionSchema,
  countsQuerySchema,
  ownReactionQuerySchema,
} from "./page-reactions.schema";
import {
  getCounts,
  getOwnReaction,
  setReaction,
  clearReaction,
} from "./page-reactions.controller";

// ─── Public router (/api/page-reactions) ─────────────────────────────────────
// Anonymous engagement — no login. Reader identity is a per-device id passed
// in the request. Writes go through firebase-admin, so no client-side
// Firestore security rules are needed.

export const pageReactionsRouter = Router();

/** GET /api/page-reactions?issueSlug=:slug&page=:n — aggregate counts */
pageReactionsRouter.get(
  "/",
  validate(countsQuerySchema, "query"),
  getCounts,
);

/** GET /api/page-reactions/own — the reader's own reaction on a page */
pageReactionsRouter.get(
  "/own",
  validate(ownReactionQuerySchema, "query"),
  getOwnReaction,
);

/** PUT /api/page-reactions — set or change a reaction */
pageReactionsRouter.put(
  "/",
  pageReactionRateLimiter,
  validate(setReactionSchema),
  setReaction,
);

/** DELETE /api/page-reactions — clear a reaction */
pageReactionsRouter.delete(
  "/",
  pageReactionRateLimiter,
  validate(clearReactionSchema),
  clearReaction,
);
