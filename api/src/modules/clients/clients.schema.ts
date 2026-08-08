import { z } from "zod";

import { optionalEmail, optionalText, optionalUrl } from "../../lib/zodFields";
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

const clientUrl = optionalUrl(500);
const clientEmail = optionalEmail(200);
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
  logoUrl: clientUrl,
  industry: optionalText(120),
  website: clientUrl,
  status: z.enum(clientStatuses).default("active"),
  tier: z.enum(clientTiers).default("standard"),

  contactName: optionalText(160),
  contactEmail: clientEmail,
  contactPhone: optionalText(60),
  billingEmail: clientEmail,
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
  contractUrl: clientUrl,

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
