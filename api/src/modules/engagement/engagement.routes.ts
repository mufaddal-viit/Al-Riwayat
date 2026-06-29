import { Router } from "express";

import { engagementRateLimiter } from "../../middleware/rateLimiter";
import { validate } from "../../middleware/validate";
import { submitEngagement } from "./engagement.controller";
import { engagementSchema } from "./engagement.schema";

const router = Router();

router.post(
  "/",
  engagementRateLimiter,
  validate(engagementSchema),
  submitEngagement,
);

export default router;
