import { z } from "zod";

import {
  contributionCategories,
  contributionStatuses,
} from "./contributions.types";

function isPublicAssetReference(value: string) {
  if (value.startsWith("/")) return true;
  return z.string().url().safeParse(value).success;
}

// ─── Public reader params ─────────────────────────────────────────────────────

export const contributionSlugParamsSchema = z.object({
  slug: z.string().trim().min(1, "Contribution slug is required."),
});

// ─── Admin params (Firestore doc id) ──────────────────────────────────────────

export const contributionIdParamsSchema = z.object({
  id: z.string().trim().min(1, "Contribution id is required."),
});

export const contributionStatusSchema = z.enum(contributionStatuses);

export const adminContributionListQuerySchema = z.object({
  status: contributionStatusSchema.optional(),
});

// ─── Shared editable display fields ───────────────────────────────────────────

const titleSchema = z
  .string()
  .trim()
  .min(3, "Title must be at least 3 characters long.")
  .max(160, "Title must be 160 characters or fewer.");

const coverImageUrlSchema = z
  .string()
  .trim()
  .min(1)
  .refine(isPublicAssetReference, "Provide a valid public image path or URL.")
  .nullable();

const editableFields = {
  title: titleSchema,
  category: z.enum(contributionCategories),
  editedContent: z
    .string()
    .trim()
    .min(20, "Body must be at least 20 characters long.")
    .max(20000, "Body must be 20000 characters or fewer."),
  excerpt: z
    .string()
    .trim()
    .min(20, "Excerpt must be at least 20 characters long.")
    .max(320, "Excerpt must be 320 characters or fewer."),
  coverImageUrl: coverImageUrlSchema,
  coverImageAlt: z
    .string()
    .trim()
    .min(10, "Cover image alt text must be at least 10 characters long.")
    .max(200, "Cover image alt text must be 200 characters or fewer.")
    .nullable(),
  featured: z.coerce.boolean(),
};

/** PATCH /:id — edit display fields without changing lifecycle. */
export const updateContributionSchema = z
  .object(editableFields)
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field to update.",
  );

/** PATCH /:id/publish — title required; other display fields optional. */
export const publishContributionSchema = z
  .object({ ...editableFields, title: titleSchema })
  .partial()
  .extend({ title: titleSchema });

export type ContributionSlugParams = z.infer<typeof contributionSlugParamsSchema>;
export type ContributionIdParams = z.infer<typeof contributionIdParamsSchema>;
export type AdminContributionListQuery = z.infer<
  typeof adminContributionListQuerySchema
>;
export type UpdateContributionInput = z.infer<typeof updateContributionSchema>;
export type PublishContributionInput = z.infer<typeof publishContributionSchema>;
