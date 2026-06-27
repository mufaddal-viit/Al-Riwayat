import { Router } from "express";

import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
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

const router = Router();

// All routes require a valid access token AND the ADMIN role.
router.use(requireAuth, requireRole("ADMIN"));

router.get(
  "/",
  /* #swagger.tags = ['Contributions Admin']
     #swagger.summary = 'List submissions (moderation queue)'
     #swagger.parameters['status'] = {
       in: 'query',
       description: 'Optional filter: pending, published, or rejected.',
       required: false,
       type: 'string'
     }
  */
  validate(adminContributionListQuerySchema, "query"),
  listContributions,
);

router.get(
  "/:id",
  /* #swagger.tags = ['Contributions Admin']
     #swagger.summary = 'Get one submission for review'
  */
  validate(contributionIdParamsSchema, "params"),
  getContribution,
);

router.patch(
  "/:id",
  /* #swagger.tags = ['Contributions Admin']
     #swagger.summary = 'Edit display fields (title, body, category, cover, featured)'
  */
  validate(contributionIdParamsSchema, "params"),
  validate(updateContributionSchema),
  updateContribution,
);

router.patch(
  "/:id/publish",
  /* #swagger.tags = ['Contributions Admin']
     #swagger.summary = 'Publish a submission to the live page (title required)'
  */
  validate(contributionIdParamsSchema, "params"),
  validate(publishContributionSchema),
  publishContribution,
);

router.patch(
  "/:id/unpublish",
  /* #swagger.tags = ['Contributions Admin']
     #swagger.summary = 'Return a published contribution to the pending queue'
  */
  validate(contributionIdParamsSchema, "params"),
  unpublishContribution,
);

router.patch(
  "/:id/reject",
  /* #swagger.tags = ['Contributions Admin']
     #swagger.summary = 'Reject a submission (soft-hide)'
  */
  validate(contributionIdParamsSchema, "params"),
  rejectContribution,
);

router.delete(
  "/:id",
  /* #swagger.tags = ['Contributions Admin']
     #swagger.summary = 'Delete a submission permanently'
  */
  validate(contributionIdParamsSchema, "params"),
  deleteContribution,
);

export default router;
