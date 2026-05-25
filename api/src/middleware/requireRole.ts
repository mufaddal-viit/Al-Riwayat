import type { Request, Response, NextFunction } from "express";
import type { Role } from "@prisma/client";

import { AppError } from "../lib/AppError";

/**
 * RBAC guard factory.
 * Usage:  router.get("/admin", requireAuth, requireRole("ADMIN"), handler)
 *
 * Must always be used AFTER requireAuth so req.user is guaranteed to exist.
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Authentication required.", 401, "MISSING_TOKEN"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(
        new AppError(
          "You do not have permission to access this resource.",
          403,
          "FORBIDDEN",
        ),
      );
      return;
    }

    next();
  };
}
