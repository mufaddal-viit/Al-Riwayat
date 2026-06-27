import { Router } from "express";

import { validate } from "../../middleware/validate";
import { requireDashboardSecret } from "../../middleware/requireDashboardSecret";
import {
  adminContributionListQuerySchema,
  contributionIdParamsSchema,
  publishContributionSchema,
  updateContributionSchema,
} from "./contributions.schema";
import {
  deleteContribution,
  getContribution,
  listContributions,
  publishContribution,
  rejectContribution,
  unpublishContribution,
  updateContribution,
} from "./contributions.admin.controller";

/**
 * Contribution moderation reached through the admin panel's Next.js BFF using
 * the shared dashboard secret. Mirrors the JWT-guarded admin router but with
 * the dashboard credential, so the admin panel uses a single auth model for
 * both reads and moderation writes.
 */
const router = Router();

router.use(requireDashboardSecret);

router.get(
  "/",
  validate(adminContributionListQuerySchema, "query"),
  listContributions,
);
router.get(
  "/:id",
  validate(contributionIdParamsSchema, "params"),
  getContribution,
);
router.patch(
  "/:id",
  validate(contributionIdParamsSchema, "params"),
  validate(updateContributionSchema),
  updateContribution,
);
router.patch(
  "/:id/publish",
  validate(contributionIdParamsSchema, "params"),
  validate(publishContributionSchema),
  publishContribution,
);
router.patch(
  "/:id/unpublish",
  validate(contributionIdParamsSchema, "params"),
  unpublishContribution,
);
router.patch(
  "/:id/reject",
  validate(contributionIdParamsSchema, "params"),
  rejectContribution,
);
router.delete(
  "/:id",
  validate(contributionIdParamsSchema, "params"),
  deleteContribution,
);

export default router;
