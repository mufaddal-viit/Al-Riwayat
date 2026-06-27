import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

import { AppError } from "../lib/AppError";
import { env } from "../lib/env";

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

/**
 * Guards admin-panel routes that are reached through the Next.js BFF using the
 * shared dashboard secret (header `x-admin-dashboard-secret`). This is the same
 * auth model the admin dashboard read endpoint uses, so the whole admin panel
 * (reads + moderation writes) shares one consistent credential.
 */
export function requireDashboardSecret(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const configuredSecret = env.ADMIN_DASHBOARD_SHARED_SECRET;

  if (!configuredSecret) {
    next(
      new AppError(
        "Admin dashboard secret is not configured.",
        500,
        "ADMIN_DASHBOARD_SECRET_MISSING",
      ),
    );
    return;
  }

  const providedSecret = req.header("x-admin-dashboard-secret") ?? "";
  if (!safeEqual(providedSecret, configuredSecret)) {
    next(new AppError("Authentication required.", 401, "MISSING_TOKEN"));
    return;
  }

  next();
}
