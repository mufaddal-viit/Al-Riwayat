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
   * Tailwind aspect-ratio classes per breakpoint. Mobile-first: the base ratio
   * is the phone shape (taller / squarer), widened on sm/lg. The image fills
   * this frame with object-cover, so upload shape never breaks the layout.
   */
  frameClass: string;
  /** Hard cap so an ad can never dominate the screen (esp. on mobile). */
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
    frameClass: "aspect-[3/2] sm:aspect-[16/6]",
    maxWidthClass: "max-w-4xl",
    guidance: { desktop: "1200×450", mobile: "800×600" },
  },
  "weekly-inline": {
    key: "weekly-inline",
    label: "Weekly article — in-line",
    description: "Between paragraphs inside a weekly article.",
    frameClass: "aspect-[3/2] sm:aspect-[16/7]",
    maxWidthClass: "max-w-[75ch]",
    guidance: { desktop: "1050×460", mobile: "800×600" },
  },
  "weekly-after": {
    key: "weekly-after",
    label: "Weekly article — after body",
    description: "Directly after the article body, before tags.",
    frameClass: "aspect-[3/2] sm:aspect-[16/6]",
    maxWidthClass: "max-w-[75ch]",
    guidance: { desktop: "1050×400", mobile: "800×600" },
  },
  "issue-before-share": {
    key: "issue-before-share",
    label: "Issue page — before share",
    description: "Before the share actions on an issue page.",
    frameClass: "aspect-[3/2] sm:aspect-[16/6]",
    maxWidthClass: "max-w-4xl",
    guidance: { desktop: "1200×450", mobile: "800×600" },
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
