import { env } from "../../lib/env";
import { prisma } from "../../lib/prisma";
import * as firestoreRepo from "./contact.repo.firestore";
import type { ContactInput } from "./contact.schema";

const useFirestoreBackend = () => env.DATA_BACKEND === "firestore";

const contactSuccessResponse = {
  success: true,
  message: "Message received.",
} as const;

export async function createContactSubmission(input: ContactInput) {
  const { name, email, message, honeypot } = input;

  if (honeypot.trim().length > 0) {
    return contactSuccessResponse;
  }

  if (useFirestoreBackend()) {
    await firestoreRepo.createContactSubmission({ name, email, message });
    return contactSuccessResponse;
  }

  await prisma.contactSubmission.create({
    data: {
      name,
      email,
      message,
    },
  });

  return contactSuccessResponse;
}
