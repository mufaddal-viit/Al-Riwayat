import { Router } from "express";

import { submitContactForm } from "../controllers/contact.controller";
import { contactRateLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import { contactSchema } from "../schemas/contact.schema";

const router = Router();

router.post("/", contactRateLimiter, validate(contactSchema), submitContactForm);

export default router;
