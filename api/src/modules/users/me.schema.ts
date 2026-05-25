import { z } from "zod";

const urlOrEmpty = z
  .string()
  .trim()
  .max(200)
  .refine(
    (v) => v === "" || /^https?:\/\/.+/i.test(v),
    "Must be a full http(s) URL or empty.",
  );

export const updateMeSchema = z
  .object({
    displayName: z.string().trim().min(1).max(80).optional(),
    bio: z.string().trim().max(500).nullable().optional(),
    occupation: z.string().trim().max(100).nullable().optional(),
    country: z.string().trim().max(80).nullable().optional(),
    interests: z
      .array(z.string().trim().min(1).max(32))
      .max(20, "At most 20 interests.")
      .optional(),
    socials: z
      .object({
        website: urlOrEmpty.optional(),
        twitter: urlOrEmpty.optional(),
        linkedin: urlOrEmpty.optional(),
      })
      .optional(),
  })
  .strict();

export type UpdateMeInput = z.infer<typeof updateMeSchema>;

export const slugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(200, "Slug too long.")
    .regex(/^[a-z0-9-]+$/i, "Invalid slug format."),
});
