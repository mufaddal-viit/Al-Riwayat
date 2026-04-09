import { Router } from "express";

import { validate } from "../../middleware/validate";
import {
  magazineIdParamsSchema,
  magazineSearchQuerySchema,
} from "./magazine.schema";
import {
  getPublishedIssues,
  getIssue,
  listIssues,
  searchIssues,
} from "./magazine.reader.controller";

const router = Router();

router.get(
  "/issues/featured",
  /* #swagger.tags = ['Magazine Reader']
     #swagger.summary = 'Get the featured issue'
     #swagger.description = 'Returns the latest published issue for homepage-style use cases.'
     #swagger.responses[200] = {
       description: 'Featured published issue.',
       schema: { $ref: '#/definitions/MagazineIssueSummary' }
     }
     #swagger.responses[404] = {
       description: 'No published issues were found.',
       schema: { $ref: '#/definitions/ErrorResponse' }
     }
  */
  getPublishedIssues,
);
router.get(
  "/issues/search",
  /* #swagger.tags = ['Magazine Reader']
     #swagger.summary = 'Search published issues'
     #swagger.description = 'Searches published issues by title, summary, and author.'
     #swagger.parameters['q'] = {
       in: 'query',
       description: 'Search phrase used against title, summary, and author.',
       required: true,
       type: 'string'
     }
     #swagger.parameters['limit'] = {
       in: 'query',
       description: 'Maximum number of issue summaries to return.',
       required: false,
       type: 'integer',
       default: 10
     }
     #swagger.responses[200] = {
       description: 'Search results.',
       schema: [{ $ref: '#/definitions/MagazineIssueSummary' }]
     }
     #swagger.responses[400] = {
       description: 'The search query parameters were invalid.',
       schema: { $ref: '#/definitions/ValidationErrorResponse' }
     }
  */
  validate(magazineSearchQuerySchema, "query"),
  searchIssues,
);
router.get(
  "/issues",
  /* #swagger.tags = ['Magazine Reader']
     #swagger.summary = 'List published issues'
     #swagger.description = 'Returns all published issues ordered from newest to oldest.'
     #swagger.responses[200] = {
       description: 'Published issue summaries.',
       schema: [{ $ref: '#/definitions/MagazineIssueSummary' }]
     }
  */
  listIssues,
);
router.get(
  "/issue/:id",
  /* #swagger.tags = ['Magazine Reader']
     #swagger.summary = 'Get one published issue'
     #swagger.description = 'Returns a single published issue by slug or Mongo id.'
     #swagger.parameters['id'] = {
       in: 'path',
       description: 'Issue slug or issue id.',
       required: true,
       type: 'string'
     }
     #swagger.responses[200] = {
       description: 'Published issue detail.',
       schema: { $ref: '#/definitions/MagazineIssueDetail' }
     }
     #swagger.responses[404] = {
       description: 'The requested published issue was not found.',
       schema: { $ref: '#/definitions/ErrorResponse' }
     }
     #swagger.responses[400] = {
       description: 'The issue identifier was invalid.',
       schema: { $ref: '#/definitions/ValidationErrorResponse' }
     }
  */
  validate(magazineIdParamsSchema, "params"),
  getIssue,
);

export default router;
