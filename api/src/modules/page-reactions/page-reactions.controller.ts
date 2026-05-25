import type { NextFunction, Request, Response } from "express";

import type {
  ClearReactionInput,
  CountsQuery,
  OwnReactionQuery,
  SetReactionInput,
} from "./page-reactions.schema";
import * as service from "./page-reactions.service";

/**
 * GET /api/page-reactions?issueSlug=:slug&page=:n
 * Aggregate reaction counts for a page.
 *
 * `req.query` is replaced by the Zod-parsed value in the `validate` middleware
 * (where `page` is coerced to a number), so we cast it to the parsed shape.
 */
export async function getCounts(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const counts = await service.getCounts(
      req.query as unknown as CountsQuery,
    );
    res.json({ success: true, data: { counts } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/page-reactions/own?readerId=:id&issueSlug=:slug&page=:n
 * The anonymous reader's own reaction on a page (or null).
 */
export async function getOwnReaction(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const reaction = await service.getOwnReaction(
      req.query as unknown as OwnReactionQuery,
    );
    res.json({ success: true, data: { reaction } });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/page-reactions
 * Set or change the reader's reaction. Returns fresh page counts.
 */
export async function setReaction(
  req: Request<Record<string, never>, unknown, SetReactionInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const counts = await service.setReaction(req.body);
    res.json({ success: true, data: { counts } });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/page-reactions
 * Clear the reader's reaction. Returns fresh page counts.
 */
export async function clearReaction(
  req: Request<Record<string, never>, unknown, ClearReactionInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const counts = await service.clearReaction(req.body);
    res.json({ success: true, data: { counts } });
  } catch (err) {
    next(err);
  }
}
