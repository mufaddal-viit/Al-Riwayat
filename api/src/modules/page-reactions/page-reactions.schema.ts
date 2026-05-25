import { z } from "zod";

// ─── Reaction keys ────────────────────────────────────────────────────────────
// Keep in sync with the web reaction-icons config.

export const REACTION_KEYS = [
  "love",
  "wow",
  "think",
  "bookmark",
  "inspire",
] as const;

const reactionKey = z.enum(REACTION_KEYS);

const issueSlug = z
  .string()
  .trim()
  .min(1, "Issue slug is required.")
  .max(200, "Issue slug too long.");

const readerId = z
  .string()
  .trim()
  .min(1, "Reader id is required.")
  .max(128, "Reader id too long.");

const page = z.coerce.number().int().min(1, "Page must be >= 1.").max(10_000);

// ─── Set / change a reaction ──────────────────────────────────────────────────

export const setReactionSchema = z.object({
  readerId,
  issueSlug,
  page,
  reaction: reactionKey,
});

// ─── Clear a reaction ─────────────────────────────────────────────────────────

export const clearReactionSchema = z.object({
  readerId,
  issueSlug,
  page,
});

// ─── List counts for a page ───────────────────────────────────────────────────

export const countsQuerySchema = z.object({
  issueSlug,
  page,
});

// ─── Own reaction lookup ──────────────────────────────────────────────────────

export const ownReactionQuerySchema = z.object({
  readerId,
  issueSlug,
  page,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReactionKey = (typeof REACTION_KEYS)[number];
export type SetReactionInput = z.infer<typeof setReactionSchema>;
export type ClearReactionInput = z.infer<typeof clearReactionSchema>;
export type CountsQuery = z.infer<typeof countsQuerySchema>;
export type OwnReactionQuery = z.infer<typeof ownReactionQuerySchema>;

export type PageReactionCounts = Record<ReactionKey, number>;

export function emptyCounts(): PageReactionCounts {
  return { love: 0, wow: 0, think: 0, bookmark: 0, inspire: 0 };
}
