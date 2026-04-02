import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";

import { prisma } from "../lib/prisma";
import type { NewsletterInput } from "../schemas/newsletter.schema";

const newsletterSuccessResponse = {
  success: true,
  message: "If eligible, the address has been recorded."
};

export async function subscribeToNewsletter(
  req: Request<Record<string, never>, unknown, NewsletterInput>,
  res: Response
) {
  const { email } = req.body;

  try {
    await prisma.newsletterSubscriber.create({
      data: {
        email
      }
    });

    return res.status(200).json(newsletterSuccessResponse);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(200).json(newsletterSuccessResponse);
    }

    console.error("Failed to store newsletter subscription.", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process the newsletter signup right now."
    });
  }
}
