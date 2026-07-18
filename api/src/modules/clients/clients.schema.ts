import { z } from "zod";

import { clientStatuses, clientTiers } from "./clients.types";

// ─── Params / query ───────────────────────────────────────────────────────────

export const clientIdParamsSchema = z.object({
  id: z.string().trim().min(1, "Client id is required."),
});

export const clientListQuerySchema = z.object({
  status: z.enum(clientStatuses).optional(),
  tier: z.enum(clientTiers).optional(),
});

// ─── Field helpers ────────────────────────────────────────────────────────────

const optionalText = (max = 300) => z.string().trim().max(max).optional().default("");
const optionalUrl = z
  .string()
  .trim()
  .url("Must be a valid URL.")
  .max(500)
  .optional()
  .or(z.literal(""))
  .transform((v) => v ?? "");
const optionalEmail = z
  .string()
  .trim()
  .email("Must be a valid email.")
  .max(200)
  .optional()
  .or(z.literal(""))
  .transform((v) => v ?? "");
const optionalNumber = z.coerce.number().min(0).optional();

const billingAddressSchema = z
  .object({
    line1: optionalText(200),
    line2: optionalText(200),
    city: optionalText(120),
    state: optionalText(120),
    country: optionalText(120),
    postalCode: optionalText(40),
  })
  .partial()
  .optional();

// ─── Content fields ───────────────────────────────────────────────────────────

const contentFields = {
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(160, "Name must be 160 characters or fewer."),
  legalName: optionalText(200),
  logoUrl: optionalUrl,
  industry: optionalText(120),
  website: optionalUrl,
  status: z.enum(clientStatuses).default("active"),
  tier: z.enum(clientTiers).default("standard"),

  contactName: optionalText(160),
  contactEmail: optionalEmail,
  contactPhone: optionalText(60),
  billingEmail: optionalEmail,
  billingAddress: billingAddressSchema,

  taxId: optionalText(80),
  vatNumber: optionalText(80),
  currency: z.string().trim().max(8).optional().default("INR"),
  paymentTerms: optionalText(120),
  accountManagerId: optionalText(120),

  contractStartDate: z.coerce
    .date()
    .optional()
    .transform((v) => (v ? v.toISOString() : undefined)),
  contractEndDate: z.coerce
    .date()
    .optional()
    .transform((v) => (v ? v.toISOString() : undefined)),
  contractUrl: optionalUrl,

  // Money rollups are manually entered in phase 1 (not auto-derived yet).
  creditLimit: optionalNumber,
  outstandingBalance: optionalNumber,
  totalSpend: optionalNumber,
  activeCampaignsCount: z.coerce.number().int().min(0).optional(),

  notes: z.string().trim().max(4000).optional().default(""),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional().default([]),
};

export const createClientSchema = z.object(contentFields);

export const updateClientSchema = z
  .object(contentFields)
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field to update.",
  );

export type ClientIdParams = z.infer<typeof clientIdParamsSchema>;
export type ClientListQuery = z.infer<typeof clientListQuerySchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
