import { z } from "zod";

import { magazineStatuses } from "./magazine.types";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isPublicAssetReference(value: string) {
  if (value.startsWith("/")) {
    return true;
  }

  return z.string().url().safeParse(value).success;
}

const publishedAtSchema = z
  .coerce
  .date()
  .refine(
    (value) => !Number.isNaN(value.getTime()),
    "Provide a valid publication date."
  );

const magazineContentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters long.")
    .max(160, "Title must be 160 characters or fewer."),
  issueNumber: z.coerce.number().int().positive("Issue number must be positive."),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters long.")
    .max(120, "Slug must be 120 characters or fewer.")
    .regex(
      slugPattern,
      "Slug must use lowercase letters, numbers, and hyphens only."
    ),
  publishedAt: publishedAtSchema,
  summary: z
    .string()
    .trim()
    .min(20, "Summary must be at least 20 characters long.")
    .max(320, "Summary must be 320 characters or fewer."),
  coverImageUrl: z
    .string()
    .trim()
    .min(1, "Cover image is required.")
    .refine(isPublicAssetReference, "Provide a valid public image path or URL."),
  coverImageAlt: z
    .string()
    .trim()
    .min(10, "Cover image alt text must be at least 10 characters long.")
    .max(200, "Cover image alt text must be 200 characters or fewer."),
  flipbookUrl: z.string().trim().url("Provide a valid flipbook URL."),
  author: z
    .string()
    .trim()
    .min(2, "Author must be at least 2 characters long.")
    .max(120, "Author must be 120 characters or fewer."),
});

export const magazineIdParamsSchema = z.object({
  id: z.string().trim().min(1, "Issue id is required."),
});

export const magazineStatusSchema = z.enum(magazineStatuses);

export const createMagazineSchema = magazineContentSchema;

export const replaceMagazineSchema = magazineContentSchema;

export const updateMagazineSchema = magazineContentSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field to update."
  );

export const magazineSearchQuerySchema = z.object({
  q: z.string().trim().min(1, "Search query is required."),
  limit: z.coerce.number().int().min(1).max(25).optional().default(10),
});

export const adminMagazineListQuerySchema = z.object({
  status: magazineStatusSchema.optional(),
});

export type CreateMagazineInput = z.infer<typeof createMagazineSchema>;
export type ReplaceMagazineInput = z.infer<typeof replaceMagazineSchema>;
export type UpdateMagazineInput = z.infer<typeof updateMagazineSchema>;
export type MagazineIdParams = z.infer<typeof magazineIdParamsSchema>;
export type MagazineSearchQuery = z.infer<typeof magazineSearchQuerySchema>;
export type AdminMagazineListQuery = z.infer<typeof adminMagazineListQuerySchema>;
