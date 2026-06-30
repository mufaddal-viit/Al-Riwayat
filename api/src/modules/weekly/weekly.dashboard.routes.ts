import { Router } from "express";

import { validate } from "../../middleware/validate";
import { requireDashboardSecret } from "../../middleware/requireDashboardSecret";
import {
  adminWeeklyListQuerySchema,
  createWeeklySchema,
  updateWeeklySchema,
  weeklyIdParamsSchema,
} from "./weekly.schema";
import {
  archiveWeekly,
  createWeekly,
  deleteWeekly,
  getWeekly,
  listWeekly,
  publishWeekly,
  unpublishWeekly,
  updateWeekly,
} from "./weekly.admin.controller";

/**
 * Weekly Riwayat admin CRUD reached through the admin panel's Next.js BFF using
 * the shared dashboard secret — same auth model as the rest of the admin panel.
 */
const router = Router();

router.use(requireDashboardSecret);

router.get("/", validate(adminWeeklyListQuerySchema, "query"), listWeekly);
router.post("/", validate(createWeeklySchema), createWeekly);
router.get("/:id", validate(weeklyIdParamsSchema, "params"), getWeekly);
router.patch(
  "/:id",
  validate(weeklyIdParamsSchema, "params"),
  validate(updateWeeklySchema),
  updateWeekly,
);
router.patch(
  "/:id/publish",
  validate(weeklyIdParamsSchema, "params"),
  publishWeekly,
);
router.patch(
  "/:id/unpublish",
  validate(weeklyIdParamsSchema, "params"),
  unpublishWeekly,
);
router.patch(
  "/:id/archive",
  validate(weeklyIdParamsSchema, "params"),
  archiveWeekly,
);
router.delete("/:id", validate(weeklyIdParamsSchema, "params"), deleteWeekly);

export default router;
