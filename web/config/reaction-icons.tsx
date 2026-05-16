/**
 * Reaction emojis — single source of truth for the page-reaction bar.
 *
 * Edit this file to add, remove, reorder, or relabel reactions. Each entry is
 * a real emoji so the bar reads as "tap an emoji to react". Emojis render with
 * no background and inherit the surrounding layout.
 *
 * NOTE: the `key` values must stay in sync with `ReactionKey` in
 * `services/pageReactionService.ts` and `REACTION_KEYS` in the API
 * (`api/src/modules/page-reactions/page-reactions.schema.ts`).
 */

import type { ReactionKey } from "@/services/pageReactionService";

export interface ReactionIcon {
  /** Stable key — must match a ReactionKey. */
  key: ReactionKey;
  /** Accessible label, also used as the tooltip. */
  label: string;
  /** The emoji shown for this reaction. */
  emoji: string;
}

export const REACTION_ICONS: ReactionIcon[] = [
  { key: "love", emoji: "❤️", label: "Love" },
  { key: "wow", emoji: "😂", label: "Made me laugh" },
  { key: "think", emoji: "💡", label: "Makes me think" },
  { key: "inspire", emoji: "🌟", label: "Inspiring" },
];
