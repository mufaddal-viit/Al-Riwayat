/**
 * Ad placement registry — the single source of truth for where ads can appear.
 *
 * A "placement" is a fixed, named slot wired into the layout in exactly one
 * spot. Admins choose a placement from this list when creating an ad; they
 * cannot invent new ones. Each placement defines its own responsive frame so a
 * single ad renders correctly (and never oversized) on phone and desktop.
 *
 * To add a slot: add an entry here, then drop <AdSlot placement="key" /> where
 * it should render. Nothing else needs to change.
 */

export const PLACEMENT_KEYS = [
  "home-social",
  "weekly-inline",
  "weekly-after",
  "issue-before-share",
] as const;

export type PlacementKey = (typeof PLACEMENT_KEYS)[number];

export interface PlacementConfig {
  key: PlacementKey;
  /** Human label shown in the admin placement dropdown. */
  label: string;
  /** Where this slot lives, for admin context. */
  description: string;
  /**
   * Max-height classes per breakpoint. The creative renders at its OWN aspect
   * ratio (never cropped) across the full slot width; this only caps how tall
   * it may grow, so an ad can't dominate the page — especially on mobile.
   */
  frameClass: string;
  /** Hard cap on how wide the slot may grow. */
  maxWidthClass: string;
  /** Recommended upload sizes, surfaced to admins as guidance. */
  guidance: {
    desktop: string;
    mobile: string;
  };
}

export const PLACEMENTS: Record<PlacementKey, PlacementConfig> = {
  "home-social": {
    key: "home-social",
    label: "Home — community section",
    description: "Between the reels carousel and the comments marquee.",
    frameClass: "max-h-[320px] sm:max-h-[380px] lg:max-h-[440px]",
    maxWidthClass: "max-w-4xl",
    guidance: { desktop: "1200×450 (any ratio works)", mobile: "800×800" },
  },
  "weekly-inline": {
    key: "weekly-inline",
    label: "Weekly article — in-line",
    description: "Between paragraphs inside a weekly article.",
    frameClass: "max-h-[300px] sm:max-h-[360px] lg:max-h-[420px]",
    maxWidthClass: "max-w-[75ch]",
    guidance: { desktop: "1050×460 (any ratio works)", mobile: "800×800" },
  },
  "weekly-after": {
    key: "weekly-after",
    label: "Weekly article — after body",
    description: "Directly after the article body, before tags.",
    frameClass: "max-h-[300px] sm:max-h-[360px] lg:max-h-[420px]",
    maxWidthClass: "max-w-[75ch]",
    guidance: { desktop: "1050×400 (any ratio works)", mobile: "800×800" },
  },
  "issue-before-share": {
    key: "issue-before-share",
    label: "Issue page — before share",
    description: "Before the share actions on an issue page.",
    frameClass: "max-h-[320px] sm:max-h-[380px] lg:max-h-[440px]",
    maxWidthClass: "max-w-4xl",
    guidance: { desktop: "1200×450 (any ratio works)", mobile: "800×800" },
  },
};

/** Ordered list for admin dropdowns. */
export const PLACEMENT_OPTIONS = PLACEMENT_KEYS.map((key) => PLACEMENTS[key]);

export function getPlacement(key: string): PlacementConfig | undefined {
  return (PLACEMENTS as Record<string, PlacementConfig>)[key];
}

export function isPlacementKey(value: unknown): value is PlacementKey {
  return typeof value === "string" && value in PLACEMENTS;
}
