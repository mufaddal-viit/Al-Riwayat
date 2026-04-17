import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().trim().email("Provide a valid email address."),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
