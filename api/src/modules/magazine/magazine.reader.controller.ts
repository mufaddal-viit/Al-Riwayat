import type { Request, Response } from "express";

import type { MagazineIdParams, MagazineSearchQuery } from "./magazine.schema";
import {
  // findFeaturedIssue,
  findPublishedIssueById,
  findPublishedIssues,
  listPublishedIssues,
  searchPublishedIssues,
} from "./magazine.service";

export async function listIssues(_req: Request, res: Response) {
  try {
    const issues = await listPublishedIssues();

    return res.status(200).json(issues);
  } catch (error) {
    console.error("Failed to list published issues.", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load issues right now.",
    });
  }
}

export async function getIssue(req: Request<MagazineIdParams>, res: Response) {
  try {
    const issue = await findPublishedIssueById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Published issue not found.",
      });
    }

    return res.status(200).json(issue);
  } catch (error) {
    console.error(`Failed to fetch issue "${req.params.id}".`, error);

    return res.status(500).json({
      success: false,
      message: "Unable to load the requested issue right now.",
    });
  }
}

export async function getPublishedIssues(_req: Request, res: Response) {
  try {
    const issues = await findPublishedIssues();

    return res.status(200).json({
      success: true,
      message: "Issues retrieved successfully.",
      data: issues,
    });
  } catch (error) {
    console.error("Failed to fetch published issues.", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load issues right now.",
    });
  }
}
export async function searchIssues(
  req: Request,
  res: Response,
) {
  try {
    const issues = await searchPublishedIssues(req.query as unknown as MagazineSearchQuery);

    return res.status(200).json(issues);
  } catch (error) {
    console.error(`Failed to search issues for "${(req.query as unknown as MagazineSearchQuery).q}".`, error);

    return res.status(500).json({
      success: false,
      message: "Unable to search issues right now.",
    });

  }
}
