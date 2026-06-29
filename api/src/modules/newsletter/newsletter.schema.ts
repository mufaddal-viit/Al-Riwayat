import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().trim().email("Provide a valid email address."),
  // Bot trap: a hidden field real users never fill. Filled → silently dropped.
  honeypot: z.string().max(200).optional().default(""),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
