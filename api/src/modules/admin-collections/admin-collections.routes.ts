import { Router } from "express";
import { z } from "zod";

import { validate } from "../../middleware/validate";
import { requireDashboardSecret } from "../../middleware/requireDashboardSecret";
import {
  deleteResource,
  listResource,
  transitionResource,
} from "./admin-collections.controller";

/**
 * Generic admin-panel CRUD for moderatable Firestore collections, reached
 * through the Next.js BFF with the shared dashboard secret. Mounted at
 * /api/admin/dashboard/collections.
 */
const router = Router();

router.use(requireDashboardSecret);

const resourceParams = z.object({
  resource: z.string().trim().min(1),
});
const resourceIdParams = resourceParams.extend({
  id: z.string().trim().min(1),
});
const resourceActionParams = resourceIdParams.extend({
  action: z.string().trim().min(1),
});

router.get("/:resource", validate(resourceParams, "params"), listResource);
router.patch(
  "/:resource/:id/:action",
  validate(resourceActionParams, "params"),
  transitionResource,
);
router.delete(
  "/:resource/:id",
  validate(resourceIdParams, "params"),
  deleteResource,
);

export default router;
