import { Router } from "express";

import { validate } from "../../middleware/validate";
import { contributionSlugParamsSchema } from "./contributions.schema";
import {
  getContribution,
  listContributions,
} from "./contributions.controller";

const router = Router();

router.get(
  "/",
  /* #swagger.tags = ['Contributions']
     #swagger.summary = 'List published contributions'
     #swagger.description = 'Returns all published community contributions ordered from newest to oldest.'
  */
  listContributions,
);

router.get(
  "/:slug",
  /* #swagger.tags = ['Contributions']
     #swagger.summary = 'Get one published contribution'
     #swagger.description = 'Returns a single published contribution by slug.'
     #swagger.parameters['slug'] = {
       in: 'path',
       description: 'Contribution slug.',
       required: true,
       type: 'string'
     }
  */
  validate(contributionSlugParamsSchema, "params"),
  getContribution,
);

export default router;
