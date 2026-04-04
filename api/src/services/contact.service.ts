import { prisma } from "../lib/prisma";
import type { ContactInput } from "../schemas/contact.schema";

const contactSuccessResponse = {
  success: true,
  message: "Message received."
} as const;

export async function createContactSubmission(input: ContactInput) {
  const { name, email, message, honeypot } = input;

  if (honeypot.trim().length > 0) {
    return contactSuccessResponse;
  }

  await prisma.contactSubmission.create({
    data: {
      name,
      email,
      message
    }
  });

  return contactSuccessResponse;
}
