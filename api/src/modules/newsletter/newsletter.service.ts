import { Prisma } from "@prisma/client";

import { env } from "../../lib/env";
import { prisma } from "../../lib/prisma";
import * as firestoreRepo from "./newsletter.repo.firestore";
import type { NewsletterInput } from "./newsletter.schema";

const useFirestoreBackend = () => env.DATA_BACKEND === "firestore";

const newsletterSuccessResponse = {
  success: true,
  message: "If eligible, the address has been recorded.",
} as const;

export async function createNewsletterSubscription(input: NewsletterInput) {
  const { email } = input;

  if (useFirestoreBackend()) {
    await firestoreRepo.createNewsletterSubscription({ email });
    return newsletterSuccessResponse;
  }

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
