import type { Request, Response } from "express";

import type { WeeklySlugParams } from "./weekly.schema";
import {
  findPublishedWeeklyBySlug,
  listPublishedWeekly,
} from "./weekly.service";

export async function listWeekly(_req: Request, res: Response) {
  try {
    const articles = await listPublishedWeekly();
    return res.status(200).json({
      success: true,
      message: "Weekly articles retrieved successfully.",
      data: articles,
    });
  } catch (error) {
    console.error("Failed to list published weekly articles.", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load weekly articles right now.",
    });
  }
}

export async function getWeekly(
  req: Request<WeeklySlugParams>,
  res: Response,
) {
  try {
    const article = await findPublishedWeeklyBySlug(req.params.slug);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Published weekly article not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Weekly article retrieved successfully.",
      data: article,
    });
  } catch (error) {
    console.error(`Failed to fetch weekly article "${req.params.slug}".`, error);
    return res.status(500).json({
      success: false,
      message: "Unable to load the requested article right now.",
    });
  }
}
