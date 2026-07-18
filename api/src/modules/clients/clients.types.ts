/**
 * Clients — advertisers who run ads on the site. A client can exist with zero
 * ads; ads reference a client by id and denormalize its name, so serving never
 * needs a cross-collection read.
 *
 *   active   — a live advertiser
 *   inactive — retained but not currently running
 *   archived — retired from the working list, kept for record
 */
export const clientStatuses = ["active", "inactive", "archived"] as const;
export type ClientStatus = (typeof clientStatuses)[number];

/** Commercial tier — informational, drives no logic yet. */
export const clientTiers = ["standard", "premium", "enterprise"] as const;
export type ClientTier = (typeof clientTiers)[number];
