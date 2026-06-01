import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";

import { AppError } from "../../lib/AppError";
import { env } from "../../lib/env";
import { getDashboard } from "./admin-dashboard.controller";

const router = Router();

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function requireDashboardSecret(
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

router.use(requireDashboardSecret);
router.get("/", getDashboard);

export default router;
