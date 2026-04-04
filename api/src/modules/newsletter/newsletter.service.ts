import { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import type { NewsletterInput } from "./newsletter.schema";

const newsletterSuccessResponse = {
  success: true,
  message: "If eligible, the address has been recorded.",
} as const;

export async function createNewsletterSubscription(input: NewsletterInput) {
  const { email } = input;

  try {
    await prisma.newsletterSubscriber.create({
      data: {
        email,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return newsletterSuccessResponse;
    }

    throw error;
  }

  return newsletterSuccessResponse;
}
