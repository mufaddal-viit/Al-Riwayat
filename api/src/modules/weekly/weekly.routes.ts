import { Router } from "express";

import { validate } from "../../middleware/validate";
import { weeklySlugParamsSchema } from "./weekly.schema";
import { getWeekly, listWeekly } from "./weekly.controller";

const router = Router();

router.get(
  "/",
  /* #swagger.tags = ['Weekly Riwayat']
     #swagger.summary = 'List published weekly articles'
  */
  listWeekly,
);

router.get(
  "/:slug",
  /* #swagger.tags = ['Weekly Riwayat']
     #swagger.summary = 'Get one published weekly article by slug'
  */
  validate(weeklySlugParamsSchema, "params"),
  getWeekly,
);

export default router;
