import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(80, "Name must be 80 characters or fewer."),
  email: z.string().trim().email("Provide a valid email address."),
  message: z
    .string()
    .trim()
    .min(20, "Message must be at least 20 characters long.")
    .max(2000, "Message must be 2000 characters or fewer."),
  honeypot: z.string().max(200).optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;
