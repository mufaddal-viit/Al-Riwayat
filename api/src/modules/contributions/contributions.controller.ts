import type { Request, Response } from "express";

import type { ContributionIdParams } from "./contributions.schema";
import {
  findPublishedContributionBySlug,
  listPublishedContributions,
} from "./contributions.service";

export async function listContributions(_req: Request, res: Response) {
  try {
    const contributions = await listPublishedContributions();

    return res.status(200).json({
      success: true,
      message: "Contributions retrieved successfully.",
      data: contributions,
    });
  } catch (error) {
    console.error("Failed to list published contributions.", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load contributions right now.",
    });
  }
}

export async function getContribution(
  req: Request<ContributionIdParams>,
  res: Response,
) {
  try {
    const contribution = await findPublishedContributionBySlug(
      req.params.slug,
    );

    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: "Published contribution not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contribution retrieved successfully.",
      data: contribution,
    });
  } catch (error) {
    console.error(
      `Failed to fetch contribution "${req.params.slug}".`,
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load the requested contribution right now.",
    });
  }
}
