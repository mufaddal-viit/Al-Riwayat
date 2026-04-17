import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../lib/AppError";
import type { UpdateMeInput } from "./me.schema";
import * as meService from "./me.service";

function requireUid(req: Request): string {
  if (!req.user) {
    throw new AppError("Authentication required.", 401, "UNAUTHENTICATED");
  }
  return req.user.sub;
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profile = await meService.getMe(requireUid(req));
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(
  req: Request<Record<string, never>, unknown, UpdateMeInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profile = await meService.updateMe(requireUid(req), req.body);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

type SlugParams = { slug: string };

function makeCollectionHandler(
  action: (uid: string, slug: string) => Promise<unknown>,
) {
  return async function handler(
    req: Request<SlugParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const profile = await action(requireUid(req), req.params.slug);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };
}

export const addBookmark = makeCollectionHandler(meService.addBookmark);
export const removeBookmark = makeCollectionHandler(meService.removeBookmark);
export const addFavourite = makeCollectionHandler(meService.addFavourite);
export const removeFavourite = makeCollectionHandler(meService.removeFavourite);
