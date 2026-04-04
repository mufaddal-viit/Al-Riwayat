import type { Request, Response } from "express";

import type { ContactInput } from "./contact.schema";
import { createContactSubmission } from "./contact.service";

export async function submitContactForm(
  req: Request<Record<string, never>, unknown, ContactInput>,
  res: Response
) {
  try {
    const response = await createContactSubmission(req.body);

    return res.status(200).json(response);
  } catch (error) {
    console.error("Failed to store contact submission.", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process the contact form right now.",
    });
  }
}
