/**
 * Ads — creative that runs in fixed layout slots (placements). Each ad belongs
 * to a client (advertiser) and denormalizes the client name, so serving never
 * needs a cross-collection read.
 *
 *   draft     — being set up, not served
 *   published — eligible to serve (subject to schedule/caps)
 *   archived  — retired, kept for record
 */
export const adStatuses = ["draft", "published", "archived"] as const;
export type AdStatus = (typeof adStatuses)[number];

/**
 * Placement keys — must stay in sync with web/lib/ads/placements.ts. The web
 * registry owns the rendering config; the backend only needs the valid keys to
 * validate input.
 */
export const placementKeys = [
  "home-social",
  "weekly-inline",
  "weekly-after",
  "issue-before-share",
] as const;
export type PlacementKey = (typeof placementKeys)[number];

/** Admin-only classification of an ad's channel(s). Not shown to readers. */
export const adChannels = [
  "website",
  "instagram-reel",
  "instagram-status",
  "whatsapp",
] as const;
export type AdChannel = (typeof adChannels)[number];

/** Only images ship in phase 1; the field exists so video can slot in later. */
export const adMediaTypes = ["image", "video"] as const;
export type AdMediaType = (typeof adMediaTypes)[number];

export const targetDevices = ["mobile", "desktop"] as const;
export type TargetDevice = (typeof targetDevices)[number];
