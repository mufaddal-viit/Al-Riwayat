import { Router } from "express";

import { contactRateLimiter } from "../../middleware/rateLimiter";
import { validate } from "../../middleware/validate";
import { submitContactForm } from "./contact.controller";
import { contactSchema } from "./contact.schema";

const router = Router();

router.post(
  "/",
  contactRateLimiter,
  validate(contactSchema),
  submitContactForm,
);

export default router;
