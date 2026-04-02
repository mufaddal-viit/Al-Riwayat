import { Router } from "express";

import { subscribeToNewsletter } from "../controllers/newsletter.controller";
import { newsletterRateLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import { newsletterSchema } from "../schemas/newsletter.schema";

const router = Router();

router.post("/", newsletterRateLimiter, validate(newsletterSchema), subscribeToNewsletter);

export default router;
