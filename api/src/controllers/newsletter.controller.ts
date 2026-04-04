import type { Request, Response } from "express";

import type { NewsletterInput } from "../schemas/newsletter.schema";
import { createNewsletterSubscription } from "../services/newsletter.service";

export async function subscribeToNewsletter(
  req: Request<Record<string, never>, unknown, NewsletterInput>,
  res: Response
) {
  try {
    const response = await createNewsletterSubscription(req.body);

    return res.status(200).json(response);
  } catch (error) {
    console.error("Failed to store newsletter subscription.", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process the newsletter signup right now."
    });
  }
}
