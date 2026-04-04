import type { Request, Response } from "express";

import { findIssueById } from "../services/magazine.service";

export async function getIssue(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const issue = await findIssueById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found. Run `npm run db:seed` to load development content."
      });
    }

    return res.status(200).json(issue);
  } catch (error) {
    console.error(`Failed to fetch issue "${req.params.id}".`, error);

    return res.status(500).json({
      success: false,
      message: "Unable to load the requested issue right now."
    });
  }
}
