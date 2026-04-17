import { Router } from "express";

import { newsletterRateLimiter } from "../../middleware/rateLimiter";
import { validate } from "../../middleware/validate";
import { subscribeToNewsletter } from "./newsletter.controller";
import { newsletterSchema } from "./newsletter.schema";

const router = Router();

router.post(
  "/",
  newsletterRateLimiter,
  validate(newsletterSchema),
  subscribeToNewsletter,
);

export default router;
