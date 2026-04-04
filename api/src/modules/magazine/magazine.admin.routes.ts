import { Router } from "express";

import { validate } from "../../middleware/validate";
import {
  adminMagazineListQuerySchema,
  createMagazineSchema,
  magazineIdParamsSchema,
  replaceMagazineSchema,
  updateMagazineSchema,
} from "./magazine.schema";
import {
  archiveIssue,
  createIssue,
  deleteIssue,
  duplicateIssue,
  getIssue,
  listIssues,
  patchIssue,
  publishIssue,
  replaceIssue,
  unpublishIssue,
} from "./magazine.admin.controller";

const router = Router();

router.post(
  "/issues",
  /* #swagger.tags = ['Magazine Admin']
     #swagger.summary = 'Create a draft issue'
     #swagger.description = 'Creates a new magazine issue in draft status.'
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: '#/definitions/CreateMagazineRequest' }
         }
       }
     }
     #swagger.responses[201] = {
       description: 'Draft issue created.',
       schema: { $ref: '#/definitions/AdminMagazineIssue' }
     }
     #swagger.responses[400] = {
       description: 'The request body was invalid.',
       schema: { $ref: '#/definitions/ValidationErrorResponse' }
     }
     #swagger.responses[409] = {
       description: 'Another issue already uses the same slug.',
       schema: { $ref: '#/definitions/ErrorResponse' }
     }
  */
  validate(createMagazineSchema),
  createIssue
);
router.get(
  "/issues",
  /* #swagger.tags = ['Magazine Admin']
     #swagger.summary = 'List admin issues'
     #swagger.description = 'Returns all issues, including drafts and archived entries, with optional lifecycle filtering.'
     #swagger.parameters['status'] = {
       in: 'query',
       description: 'Optional lifecycle filter: draft, published, or archived.',
       required: false,
       type: 'string'
     }
     #swagger.responses[200] = {
       description: 'Admin issue summaries.',
       schema: [{ $ref: '#/definitions/AdminMagazineIssue' }]
     }
     #swagger.responses[400] = {
       description: 'The query string was invalid.',
       schema: { $ref: '#/definitions/ValidationErrorResponse' }
     }
  */
  validate(adminMagazineListQuerySchema, "query"),
  listIssues
);
router.get(
  "/issues/:id",
  /* #swagger.tags = ['Magazine Admin']
     #swagger.summary = 'Get one issue for editing'
     #swagger.description = 'Returns a full issue record by slug or Mongo id, regardless of status.'
     #swagger.parameters['id'] = {
       in: 'path',
       description: 'Issue slug or issue id.',
       required: true,
       type: 'string'
     }
     #swagger.responses[200] = {
       description: 'Full admin issue detail.',
       schema: { $ref: '#/definitions/AdminMagazineIssue' }
     }
     #swagger.responses[404] = {
       description: 'The requested issue was not found.',
       schema: { $ref: '#/definitions/ErrorResponse' }
     }
  */
  validate(magazineIdParamsSchema, "params"),
  getIssue
);
router.patch(
  "/issues/:id",
  /* #swagger.tags = ['Magazine Admin']
     #swagger.summary = 'Patch an issue'
     #swagger.description = 'Updates one or more issue fields without replacing the full record.'
     #swagger.parameters['id'] = {
       in: 'path',
       description: 'Issue slug or issue id.',
       required: true,
       type: 'string'
     }
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: '#/definitions/UpdateMagazineRequest' }
         }
       }
     }
     #swagger.responses[200] = {
       description: 'Updated issue.',
       schema: { $ref: '#/definitions/AdminMagazineIssue' }
     }
     #swagger.responses[400] = {
       description: 'The request body or path parameters were invalid.',
       schema: { $ref: '#/definitions/ValidationErrorResponse' }
     }
     #swagger.responses[404] = {
       description: 'The requested issue was not found.',
       schema: { $ref: '#/definitions/ErrorResponse' }
     }
     #swagger.responses[409] = {
       description: 'Another issue already uses the requested slug.',
       schema: { $ref: '#/definitions/ErrorResponse' }
     }
  */
  validate(magazineIdParamsSchema, "params"),
  validate(updateMagazineSchema),
  patchIssue
);
router.put(
  "/issues/:id",
  /* #swagger.tags = ['Magazine Admin']
     #swagger.summary = 'Replace an issue'
     #swagger.description = 'Replaces the full issue document with a validated payload.'
     #swagger.parameters['id'] = {
       in: 'path',
       description: 'Issue slug or issue id.',
       required: true,
       type: 'string'
     }
     #swagger.requestBody = {
       required: true,
       content: {
         "application/json": {
           schema: { $ref: '#/definitions/CreateMagazineRequest' }
         }
       }
     }
     #swagger.responses[200] = {
       description: 'Replaced issue.',
       schema: { $ref: '#/definitions/AdminMagazineIssue' }
     }
     #swagger.responses[400] = {
       description: 'The request body or path parameters were invalid.',
       schema: { $ref: '#/definitions/ValidationErrorResponse' }
     }
     #swagger.responses[404] = {
       description: 'The requested issue was not found.',
       schema: { $ref: '#/definitions/ErrorResponse' }
     }
     #swagger.responses[409] = {
       description: 'Another issue already uses the requested slug.',
       schema: { $ref: '#/definitions/ErrorResponse' }
     }
  */
  validate(magazineIdParamsSchema, "params"),
  validate(replaceMagazineSchema),
  replaceIssue
);
router.delete(
  "/issues/:id",
  /* #swagger.tags = ['Magazine Admin']
     #swagger.summary = 'Delete an issue'
     #swagger.description = 'Deletes an issue permanently.'
     #swagger.parameters['id'] = {
       in: 'path',
       description: 'Issue slug or issue id.',
       required: true,
       type: 'string'
     }
     #swagger.responses[200] = {
       description: 'Deletion result.',
       schema: { $ref: '#/definitions/DeleteMagazineResponse' }
     }
     #swagger.responses[404] = {
       description: 'The requested issue was not found.',
       schema: { $ref: '#/definitions/ErrorResponse' }
     }
  */
  validate(magazineIdParamsSchema, "params"),
  deleteIssue
);
router.patch(
  "/issues/:id/publish",
  /* #swagger.tags = ['Magazine Admin']
     #swagger.summary = 'Publish an issue'
     #swagger.description = 'Moves an issue into the published lifecycle state.'
     #swagger.parameters['id'] = {
       in: 'path',
       description: 'Issue slug or issue id.',
       required: true,
       type: 'string'
     }
     #swagger.responses[200] = {
       description: 'Published issue.',
       schema: { $ref: '#/definitions/AdminMagazineIssue' }
     }
     #swagger.responses[404] = {
       description: 'The requested issue was not found.',
       schema: { $ref: '#/definitions/ErrorResponse' }
     }
  */
  validate(magazineIdParamsSchema, "params"),
  publishIssue
);
router.patch(
  "/issues/:id/unpublish",
  /* #swagger.tags = ['Magazine Admin']
     #swagger.summary = 'Unpublish an issue'
     #swagger.description = 'Moves an issue back into draft state.'
     #swagger.parameters['id'] = {
       in: 'path',
       description: 'Issue slug or issue id.',
       required: true,
       type: 'string'
     }
     #swagger.responses[200] = {
       description: 'Draft issue.',
       schema: { $ref: '#/definitions/AdminMagazineIssue' }
     }
     #swagger.responses[404] = {
       description: 'The requested issue was not found.',
       schema: { $ref: '#/definitions/ErrorResponse' }
     }
  */
  validate(magazineIdParamsSchema, "params"),
  unpublishIssue
);
router.patch(
  "/issues/:id/archive",
  /* #swagger.tags = ['Magazine Admin']
     #swagger.summary = 'Archive an issue'
     #swagger.description = 'Moves an issue into the archived lifecycle state.'
     #swagger.parameters['id'] = {
       in: 'path',
       description: 'Issue slug or issue id.',
       required: true,
       type: 'string'
     }
     #swagger.responses[200] = {
       description: 'Archived issue.',
       schema: { $ref: '#/definitions/AdminMagazineIssue' }
     }
     #swagger.responses[404] = {
       description: 'The requested issue was not found.',
       schema: { $ref: '#/definitions/ErrorResponse' }
     }
  */
  validate(magazineIdParamsSchema, "params"),
  archiveIssue
);
router.post(
  "/issues/:id/duplicate",
  /* #swagger.tags = ['Magazine Admin']
     #swagger.summary = 'Duplicate an issue'
     #swagger.description = 'Creates a draft copy of an existing issue with a generated copy slug.'
     #swagger.parameters['id'] = {
       in: 'path',
       description: 'Issue slug or issue id.',
       required: true,
       type: 'string'
     }
     #swagger.responses[201] = {
       description: 'Duplicated draft issue.',
       schema: { $ref: '#/definitions/AdminMagazineIssue' }
     }
     #swagger.responses[404] = {
       description: 'The requested issue was not found.',
       schema: { $ref: '#/definitions/ErrorResponse' }
     }
     #swagger.responses[409] = {
       description: 'A safe duplicate slug could not be generated.',
       schema: { $ref: '#/definitions/ErrorResponse' }
     }
  */
  validate(magazineIdParamsSchema, "params"),
  duplicateIssue
);

export default router;
