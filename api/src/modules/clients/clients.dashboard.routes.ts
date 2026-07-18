import { Router } from "express";

import { validate } from "../../middleware/validate";
import { requireDashboardSecret } from "../../middleware/requireDashboardSecret";
import {
  clientIdParamsSchema,
  clientListQuerySchema,
  createClientSchema,
  updateClientSchema,
} from "./clients.schema";
import {
  archiveClientController,
  createClientController,
  deleteClientController,
  getClientController,
  listClientsController,
  updateClientController,
} from "./clients.admin.controller";

/**
 * Client (advertiser) CRUD reached through the admin panel's Next.js BFF using
 * the shared dashboard secret — same auth model as the rest of the admin panel.
 */
const router = Router();

router.use(requireDashboardSecret);

router.get("/", validate(clientListQuerySchema, "query"), listClientsController);
router.post("/", validate(createClientSchema), createClientController);
router.get("/:id", validate(clientIdParamsSchema, "params"), getClientController);
router.patch(
  "/:id",
  validate(clientIdParamsSchema, "params"),
  validate(updateClientSchema),
  updateClientController,
);
router.patch(
  "/:id/archive",
  validate(clientIdParamsSchema, "params"),
  archiveClientController,
);
router.delete(
  "/:id",
  validate(clientIdParamsSchema, "params"),
  deleteClientController,
);

export default router;
