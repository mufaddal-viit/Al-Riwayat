import { z } from "zod";

export const engagementSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z.string().trim().toLowerCase().email("Provide a valid email address."),
  age: z.coerce.number().int().min(13).max(120),
  occupation: z.string().trim().min(1, "Occupation is required.").max(120),
  subscribeToEmails: z.boolean().default(false),
  // Bot trap: a hidden field real users never fill. Filled → silently dropped.
  honeypot: z.string().max(200).optional().default(""),
});

export type EngagementInput = z.infer<typeof engagementSchema>;
