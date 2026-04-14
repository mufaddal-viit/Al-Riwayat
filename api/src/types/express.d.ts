import type { Role } from "@prisma/client";

/**
 * Augment Express's Request interface so req.user is available throughout
 * the app after requireAuth middleware populates it.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;    // User.id
        email: string;
        role: Role;
      };
    }
  }
}

export {};
