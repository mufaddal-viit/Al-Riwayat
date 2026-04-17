import { Router } from "express";

import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { adminUpdateUserSchema, listUsersQuerySchema } from "../auth/auth.schema";
import * as usersController from "./users.controller";

const router = Router();

// All routes in this module require authentication and ADMIN role
router.use(requireAuth, requireRole("ADMIN"));

router.get(
  "/",
  validate(listUsersQuerySchema, "query"),
  usersController.listUsers,
);

router.get("/:id", usersController.getUserById);

router.patch(
  "/:id",
  validate(adminUpdateUserSchema),
  usersController.updateUser,
);

router.delete("/:id", usersController.deleteUser);

export default router;
