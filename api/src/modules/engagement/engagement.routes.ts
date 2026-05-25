import { Router } from "express";

import { newsletterRateLimiter } from "../../middleware/rateLimiter";
import { validate } from "../../middleware/validate";
import { submitEngagement } from "./engagement.controller";
import { engagementSchema } from "./engagement.schema";

const router = Router();

router.post(
  "/",
  newsletterRateLimiter,
  validate(engagementSchema),
  submitEngagement,
);

export default router;
