import { Router } from "express";
import {
  getComments,
  createComment,
  deleteComment,
  approveComment,
} from "./comments.controller";
import { commentParamSchema } from "./comments.schema";
import { validate } from "../../middleware/validate";

const router = Router();

router.get("/", getComments);
router.post("/", createComment);

router.delete("/:id", validate(commentParamSchema, "params"), deleteComment);
router.patch(
  "/:id/approve",
  validate(commentParamSchema, "params"),
  approveComment,
);

export default router;
