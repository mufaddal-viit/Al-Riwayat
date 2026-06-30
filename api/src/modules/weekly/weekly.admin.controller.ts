import type { Request, Response } from "express";

import type {
  AdminWeeklyListQuery,
  CreateWeeklyInput,
  UpdateWeeklyInput,
  WeeklyIdParams,
} from "./weekly.schema";
import {
  archiveWeekly as archiveWeeklyRecord,
  createWeekly as createWeeklyRecord,
  deleteWeekly as deleteWeeklyRecord,
  findAdminWeeklyById,
  listAdminWeekly,
  publishWeekly as publishWeeklyRecord,
  unpublishWeekly as unpublishWeeklyRecord,
  updateWeekly as updateWeeklyRecord,
} from "./weekly.service";

const notFound = (res: Response) =>
  res.status(404).json({ success: false, message: "Article not found." });

export async function listWeekly(
  req: Request<Record<string, never>, unknown, unknown, AdminWeeklyListQuery>,
  res: Response,
) {
  try {
    const articles = await listAdminWeekly(req.query.status);
    return res.status(200).json({ success: true, data: articles });
  } catch (error) {
    console.error("Failed to list admin weekly articles.", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load articles right now.",
    });
  }
}

export async function getWeekly(
  req: Request<WeeklyIdParams>,
  res: Response,
) {
  try {
    const article = await findAdminWeeklyById(req.params.id);
    if (!article) return notFound(res);
    return res.status(200).json({ success: true, data: article });
  } catch (error) {
    console.error(`Failed to fetch admin weekly "${req.params.id}".`, error);
    return res.status(500).json({
      success: false,
      message: "Unable to load the requested article right now.",
    });
  }
}

export async function createWeekly(
  req: Request<Record<string, never>, unknown, CreateWeeklyInput>,
  res: Response,
) {
  try {
    const article = await createWeeklyRecord(req.body);
    return res.status(201).json({ success: true, data: article });
  } catch (error) {
    console.error("Failed to create weekly article.", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create the article right now.",
    });
  }
}

export async function updateWeekly(
  req: Request<WeeklyIdParams, unknown, UpdateWeeklyInput>,
  res: Response,
) {
  try {
    const article = await updateWeeklyRecord(req.params.id, req.body);
    if (!article) return notFound(res);
    return res.status(200).json({ success: true, data: article });
  } catch (error) {
    console.error(`Failed to update weekly "${req.params.id}".`, error);
    return res.status(500).json({
      success: false,
      message: "Unable to update the article right now.",
    });
  }
}

function lifecycleHandler(
  fn: (id: string) => Promise<unknown>,
  failMessage: string,
) {
  return async (req: Request<WeeklyIdParams>, res: Response) => {
    try {
      const article = await fn(req.params.id);
      if (!article) return notFound(res);
      return res.status(200).json({ success: true, data: article });
    } catch (error) {
      console.error(`${failMessage} "${req.params.id}".`, error);
      return res.status(500).json({ success: false, message: failMessage });
    }
  };
}

export const publishWeekly = lifecycleHandler(
  publishWeeklyRecord,
  "Unable to publish the article.",
);
export const unpublishWeekly = lifecycleHandler(
  unpublishWeeklyRecord,
  "Unable to unpublish the article.",
);
export const archiveWeekly = lifecycleHandler(
  archiveWeeklyRecord,
  "Unable to archive the article.",
);

export async function deleteWeekly(
  req: Request<WeeklyIdParams>,
  res: Response,
) {
  try {
    const article = await deleteWeeklyRecord(req.params.id);
    if (!article) return notFound(res);
    return res.status(200).json({
      success: true,
      message: "Article deleted.",
      data: article,
    });
  } catch (error) {
    console.error(`Failed to delete weekly "${req.params.id}".`, error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete the article right now.",
    });
  }
}
