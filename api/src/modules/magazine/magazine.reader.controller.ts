import type { Request, Response } from "express";

import type { MagazineIdParams, MagazineSearchQuery } from "./magazine.schema";
import {
  findFeaturedIssue,
  findPublishedIssueById,
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

export async function getIssue(
  req: Request<MagazineIdParams>,
  res: Response
) {
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

export async function getFeaturedIssue(_req: Request, res: Response) {
  try {
    const issue = await findFeaturedIssue();

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "No published issues are available yet.",
      });
    }

    return res.status(200).json(issue);
  } catch (error) {
    console.error("Failed to fetch the featured issue.", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load the featured issue right now.",
    });
  }
}

export async function searchIssues(
  req: Request<Record<string, never>, unknown, unknown, MagazineSearchQuery>,
  res: Response
) {
  try {
    const issues = await searchPublishedIssues(req.query);

    return res.status(200).json(issues);
  } catch (error) {
    console.error(`Failed to search issues for "${req.query.q}".`, error);

    return res.status(500).json({
      success: false,
      message: "Unable to search issues right now.",
    });
  }
}
