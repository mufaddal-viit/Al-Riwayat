import type { NextFunction, Request, Response } from "express";

import type { ContactInput } from "./contact.schema";
import { createContactSubmission } from "./contact.service";

export async function submitContactForm(
  req: Request<Record<string, never>, unknown, ContactInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await createContactSubmission(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
