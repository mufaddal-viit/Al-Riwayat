import { Router } from "express";

import { validate } from "../../middleware/validate";
import { requireDashboardSecret } from "../../middleware/requireDashboardSecret";
import {
  adIdParamsSchema,
  adListQuerySchema,
  createAdSchema,
  updateAdSchema,
} from "./ads.schema";
import {
  archiveAdController,
  createAdController,
  deleteAdController,
  getAdController,
  listAdsController,
  publishAdController,
  unpublishAdController,
  updateAdController,
} from "./ads.admin.controller";
import {
  adStatsParamsSchema,
  adStatsQuerySchema,
} from "./ads.stats.schema";
import {
  getAdStatsController,
  resetAdStatsController,
} from "./ads.stats.controller";

/**
 * Ad CRUD + lifecycle reached through the admin panel's Next.js BFF using the
 * shared dashboard secret — same auth model as the rest of the admin panel.
 */
const router = Router();

router.use(requireDashboardSecret);

router.get("/", validate(adListQuerySchema, "query"), listAdsController);
router.post("/", validate(createAdSchema), createAdController);
router.get("/:id", validate(adIdParamsSchema, "params"), getAdController);
router.get(
  "/:id/stats",
  validate(adStatsParamsSchema, "params"),
  validate(adStatsQuerySchema, "query"),
  getAdStatsController,
);
router.delete(
  "/:id/stats",
  validate(adStatsParamsSchema, "params"),
  resetAdStatsController,
);
router.patch(
  "/:id",
  validate(adIdParamsSchema, "params"),
  validate(updateAdSchema),
  updateAdController,
);
router.patch("/:id/publish", validate(adIdParamsSchema, "params"), publishAdController);
router.patch("/:id/unpublish", validate(adIdParamsSchema, "params"), unpublishAdController);
router.patch("/:id/archive", validate(adIdParamsSchema, "params"), archiveAdController);
router.delete("/:id", validate(adIdParamsSchema, "params"), deleteAdController);

export default router;
