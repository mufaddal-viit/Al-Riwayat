import { z } from "zod";

import { weeklyStatuses } from "./weekly.types";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ─── Public reader params ─────────────────────────────────────────────────────

export const weeklySlugParamsSchema = z.object({
  slug: z.string().trim().min(1, "Article slug is required."),
});

// ─── Admin params (Firestore doc id) ──────────────────────────────────────────

export const weeklyIdParamsSchema = z.object({
  id: z.string().trim().min(1, "Article id is required."),
});

export const weeklyStatusSchema = z.enum(weeklyStatuses);

export const adminWeeklyListQuerySchema = z.object({
  status: weeklyStatusSchema.optional(),
});

// ─── Content fields ───────────────────────────────────────────────────────────

const titleSchema = z
  .string()
  .trim()
  .min(3, "Title must be at least 3 characters long.")
  .max(160, "Title must be 160 characters or fewer.");

const optionalSlug = z
  .string()
  .trim()
  .min(3, "Slug must be at least 3 characters long.")
  .max(120, "Slug must be 120 characters or fewer.")
  .regex(
    slugPattern,
    "Slug must use lowercase letters, numbers, and hyphens only.",
  )
  .optional();

const contentFields = {
  title: titleSchema,
  slug: optionalSlug,
  subtitle: z.string().trim().max(240).optional().default(""),
  author: z
    .string()
    .trim()
    .min(2, "Author must be at least 2 characters long.")
    .max(120)
    .default("Editorial Desk"),
  excerpt: z
    .string()
    .trim()
    .min(20, "Excerpt must be at least 20 characters long.")
    .max(360, "Excerpt must be 360 characters or fewer."),
  body: z
    .string()
    .trim()
    .min(20, "Body must be at least 20 characters long.")
    .max(50000, "Body must be 50000 characters or fewer."),
  readingTime: z.coerce
    .number()
    .int()
    .min(1, "Reading time must be at least 1 minute.")
    .max(120),
  weekOf: z.coerce
    .date()
    .optional()
    .transform((value) => (value ? value.toISOString() : undefined)),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).optional().default([]),
};

export const createWeeklySchema = z.object(contentFields);

export const updateWeeklySchema = z
  .object(contentFields)
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field to update.",
  );

export type WeeklySlugParams = z.infer<typeof weeklySlugParamsSchema>;
export type WeeklyIdParams = z.infer<typeof weeklyIdParamsSchema>;
export type AdminWeeklyListQuery = z.infer<typeof adminWeeklyListQuerySchema>;
export type CreateWeeklyInput = z.infer<typeof createWeeklySchema>;
export type UpdateWeeklyInput = z.infer<typeof updateWeeklySchema>;
