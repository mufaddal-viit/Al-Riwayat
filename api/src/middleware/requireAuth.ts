import type { Request, Response, NextFunction } from "express";

import { verifyAccessToken } from "../modules/auth/token.service";
import { AppError } from "../lib/AppError";

/**
 * Verify the Bearer access token from the Authorization header.
 * On success, attaches the decoded payload to req.user.
 * On failure, passes an AppError to next() which the global handler serialises.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    next(new AppError("Authentication required.", 401, "MISSING_TOKEN"));
    return;
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    req.user = payload;
    next();
  } catch (err) {
    // verifyAccessToken already throws typed AppErrors; forward them as-is
    next(err instanceof AppError ? err : new AppError("Authentication failed.", 401, "INVALID_TOKEN"));
  }
}
