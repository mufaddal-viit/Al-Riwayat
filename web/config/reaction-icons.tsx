/**
 * Reaction icons — single source of truth for the page-reaction bar.
 *
 * Edit this file to add, remove, reorder, restyle, or relabel reactions.
 * Icons are lucide-react SVGs: stroke-based, transparent background, and
 * inherit `currentColor` so they sit seamlessly on any surface.
 *
 * NOTE: the `key` values must stay in sync with `ReactionKey` in
 * `services/pageReactionService.ts` and `REACTION_KEYS` in the API
 * (`api/src/modules/page-reactions/page-reactions.schema.ts`).
 */

import {
  Heart,
  Sparkles,
  Lightbulb,
  Star,
  type LucideIcon,
} from "lucide-react";

import type { ReactionKey } from "@/services/pageReactionService";

export interface ReactionIcon {
  /** Stable key — must match a ReactionKey. */
  key: ReactionKey;
  /** Accessible label, also used as the tooltip. */
  label: string;
  /** lucide-react icon component. */
  Icon: LucideIcon;
  /** Tailwind text color applied when the reaction is active. */
  activeColor: string;
}

export const REACTION_ICONS: ReactionIcon[] = [
  {
    key: "love",
    label: "Love",
    Icon: Heart,
    activeColor: "text-rose-500",
  },
  {
    key: "wow",
    label: "Wow",
    Icon: Sparkles,
    activeColor: "text-amber-500",
  },
  {
    key: "think",
    label: "Makes me think",
    Icon: Lightbulb,
    activeColor: "text-sky-500",
  },
  {
    key: "inspire",
    label: "Inspiring",
    Icon: Star,
    activeColor: "text-violet-500",
  },
];
