import type { Request, Response } from "express";

import type { EngagementInput } from "./engagement.schema";
import { createEngagementSubmission } from "./engagement.service";

export async function submitEngagement(
  req: Request<Record<string, never>, unknown, EngagementInput>,
  res: Response,
) {
  try {
    const response = await createEngagementSubmission(req.body);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Failed to store engagement submission.", error);
    return res.status(500).json({
      success: false,
      message: "Unable to record your submission right now.",
    });
  }
}
