import { Router } from "express";

import { validate } from "../../middleware/validate";
import { adEventsRateLimiter } from "../../middleware/rateLimiter";
import { adServeQuerySchema } from "./ads.schema";
import { serveAdsController } from "./ads.public.controller";
import { recordAdEventsController } from "./ads.stats.controller";

/** Public ad serving + event ingestion — no auth. Used by <AdSlot>. */
const router = Router();

router.get("/", validate(adServeQuerySchema, "query"), serveAdsController);
router.post("/events", adEventsRateLimiter, recordAdEventsController);

export default router;
