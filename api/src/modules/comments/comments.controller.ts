import type { Request, Response } from "express";
import { validate } from "../../middleware/validate";
import {
  commentParamSchema,
  createCommentSchema,
  getCommentsQuerySchema,
} from "./comments.schema";
import * as commentService from "./comments.service";

export const getComments = [
  //middleware
  validate(getCommentsQuerySchema, "query"),
  //request handler
  async (req: Request, res: Response) => {
    const { slug } = req.query as any;
    const comments = await commentService.getApprovedComments(slug as string);
    res.json({
      success: true,
      data: comments,
    });
  },
];

export const createComment = [
  validate(createCommentSchema),
  async (req: Request, res: Response) => {
    const data = req.body as any;
    const comment = await commentService.createComment(data);
    res.status(201).json({
      success: true,
      data: comment,
    });
  },
];

export const deleteComment = async (req: Request, res: Response) => {
  // TODO: auth check
  if (!req.headers.authorization) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { id } = req.params;
  const result = await commentService.deleteComment(id);
  res.json({
    success: true,
    data: result,
  });
};

export const approveComment = async (req: Request, res: Response) => {
  // TODO: auth check
  if (!req.headers.authorization) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { id } = req.params;
  const comment = await commentService.approveComment(id);
  res.json({
    success: true,
    data: comment,
  });
};
