import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../lib/AppError";
import { submissionSchema } from "./submissions.schema";
import { createSubmission } from "./submissions.service";

export async function submitContribution(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = submissionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid submission.",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length > 5) {
      throw new AppError(
        "You can attach at most 5 files.",
        400,
        "TOO_MANY_FILES",
      );
    }

    const result = await createSubmission(parsed.data, files);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
