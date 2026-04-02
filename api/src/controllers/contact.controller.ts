import type { Request, Response } from "express";

import type { ContactInput } from "../schemas/contact.schema";
import { prisma } from "../lib/prisma";

const contactSuccessResponse = {
  success: true,
  message: "Message received."
};

export async function submitContactForm(
  req: Request<Record<string, never>, unknown, ContactInput>,
  res: Response
) {
  const { name, email, message, honeypot } = req.body;

  if (honeypot.trim().length > 0) {
    return res.status(200).json(contactSuccessResponse);
  }

  try {
    await prisma.contactSubmission.create({
      data: {
        name,
        email,
        message
      }
    });

    return res.status(200).json(contactSuccessResponse);
  } catch (error) {
    console.error("Failed to store contact submission.", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process the contact form right now."
    });
  }
}
