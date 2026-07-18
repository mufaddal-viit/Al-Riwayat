import { z } from "zod";

import { targetDevices } from "./ads.types";

/**
 * A batch of ad events sent by the browser. Kept small and permissive — this is
 * a public endpoint, so it is rate-limited and de-duplicated server-side, and
 * anything malformed is dropped rather than trusted.
 */
export const adEventSchema = z.object({
  adId: z.string().trim().min(1).max(200),
  type: z.enum(["impression", "click"]),
  device: z.enum(targetDevices).optional(),
});

export const recordAdEventsSchema = z.object({
  events: z.array(adEventSchema).min(1).max(50),
});

// ─── Admin stats read ─────────────────────────────────────────────────────────

export const adStatsParamsSchema = z.object({
  id: z.string().trim().min(1, "Ad id is required."),
});

export const adStatsQuerySchema = z.object({
  // Inclusive yyyy-mm-dd range; defaults applied in the controller.
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "from must be yyyy-mm-dd.")
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "to must be yyyy-mm-dd.")
    .optional(),
});

export type AdEvent = z.infer<typeof adEventSchema>;
export type RecordAdEventsInput = z.infer<typeof recordAdEventsSchema>;
export type AdStatsParams = z.infer<typeof adStatsParamsSchema>;
export type AdStatsQuery = z.infer<typeof adStatsQuerySchema>;
