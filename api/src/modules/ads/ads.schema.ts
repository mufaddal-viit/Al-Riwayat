import { z } from "zod";

import {
  adChannels,
  adMediaTypes,
  adStatuses,
  placementKeys,
  targetDevices,
} from "./ads.types";

// ─── Params / query ───────────────────────────────────────────────────────────

export const adIdParamsSchema = z.object({
  id: z.string().trim().min(1, "Ad id is required."),
});

export const adListQuerySchema = z.object({
  status: z.enum(adStatuses).optional(),
  placement: z.enum(placementKeys).optional(),
  clientId: z.string().trim().min(1).optional(),
});

/** Public serving query — a reader page asks for one placement's live ads. */
export const adServeQuerySchema = z.object({
  placement: z.enum(placementKeys),
  device: z.enum(targetDevices).optional(),
});

// ─── Field helpers ────────────────────────────────────────────────────────────

const optionalText = (max = 300) => z.string().trim().max(max).optional().default("");
const cloudinaryUrl = z
  .string()
  .trim()
  .url("Must be a valid URL.")
  .max(600);
const optionalCloudinaryUrl = cloudinaryUrl.optional().or(z.literal("")).transform((v) => v ?? "");
const optionalHttpUrl = z
  .string()
  .trim()
  .url("Must be a valid URL.")
  .max(600)
  .optional()
  .or(z.literal(""))
  .transform((v) => v ?? "");

const linksSchema = z
  .object({
    website: optionalHttpUrl,
    instagramReel: optionalHttpUrl,
    instagramStatus: optionalHttpUrl,
    // WhatsApp stored as raw phone + optional message; the click URL is built
    // on render. Kept as text so "+" and spaces validate.
    whatsappPhone: optionalText(30),
    whatsappMessage: optionalText(300),
  })
  .partial()
  .optional();

const targetingSchema = z
  .object({
    devices: z.array(z.enum(targetDevices)).max(2).optional().default([]),
    pages: z.array(z.string().trim().min(1).max(200)).max(50).optional().default([]),
    locales: z.array(z.string().trim().min(2).max(10)).max(20).optional().default([]),
  })
  .partial()
  .optional();

// ─── Content fields ───────────────────────────────────────────────────────────

const contentFields = {
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters.")
    .max(160, "Title must be 160 characters or fewer."),

  clientId: optionalText(120),
  // Denormalized from the client at save time; serving never joins collections.
  clientName: optionalText(160),

  mediaType: z.enum(adMediaTypes).default("image"),
  // Two creatives: desktop is required for a published ad; mobile optional
  // (falls back to desktop). Enforced at publish, not at draft save.
  desktopImageUrl: optionalCloudinaryUrl,
  mobileImageUrl: optionalCloudinaryUrl,
  videoUrl: optionalCloudinaryUrl,
  fallbackImageUrl: optionalCloudinaryUrl,
  alt: optionalText(300),
  width: z.coerce.number().int().min(0).optional(),
  height: z.coerce.number().int().min(0).optional(),

  // One ad can run in several slots. At least one placement is required.
  placements: z
    .array(z.enum(placementKeys))
    .min(1, "Choose at least one placement.")
    .max(placementKeys.length),

  // Admin-only channel tags (multi). Do not affect what a reader sees.
  channels: z.array(z.enum(adChannels)).max(4).optional().default([]),
  links: linksSchema,
  // The one URL the tapped image opens.
  linkUrl: optionalHttpUrl,
  openInNewTab: z.boolean().optional().default(true),
  utmSource: optionalText(80),
  utmMedium: optionalText(80),
  utmCampaign: optionalText(120),

  status: z.enum(adStatuses).default("draft"),
  startsAt: z.coerce
    .date()
    .optional()
    .transform((v) => (v ? v.toISOString() : undefined)),
  endsAt: z.coerce
    .date()
    .optional()
    .transform((v) => (v ? v.toISOString() : undefined)),
  priority: z.coerce.number().int().min(0).max(1000).optional().default(0),
  weight: z.coerce.number().int().min(1).max(1000).optional().default(1),

  targeting: targetingSchema,

  maxImpressions: z.coerce.number().int().min(0).optional(),
  maxClicks: z.coerce.number().int().min(0).optional(),

  notes: z.string().trim().max(2000).optional().default(""),
  campaignId: optionalText(120),
};

export const createAdSchema = z.object(contentFields);

export const updateAdSchema = z
  .object(contentFields)
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field to update.",
  );

export type AdIdParams = z.infer<typeof adIdParamsSchema>;
export type AdListQuery = z.infer<typeof adListQuerySchema>;
export type AdServeQuery = z.infer<typeof adServeQuerySchema>;
export type CreateAdInput = z.infer<typeof createAdSchema>;
export type UpdateAdInput = z.infer<typeof updateAdSchema>;
