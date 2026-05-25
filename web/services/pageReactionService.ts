import { apiClient } from "@/lib/api/client";
import { apiConfig } from "@/lib/api/config";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { AppError } from "@/lib/api/error";

export type ReactionKey = "love" | "wow" | "think" | "bookmark" | "inspire";

export type PageReactionCounts = Record<ReactionKey, number>;

export const EMPTY_REACTION_COUNTS: PageReactionCounts = {
  love: 0,
  wow: 0,
  think: 0,
  bookmark: 0,
  inspire: 0,
};

function requireReactionsApi() {
  if (!apiConfig.enabled) {
    throw new AppError({
      message: "Page reactions are unavailable right now.",
      status: 503,
      code: "API_NOT_CONFIGURED",
    });
  }
}

/**
 * Page reactions are anonymous, per-device engagement signals. They are
 * written through the `/api` backend (firebase-admin), NOT the browser
 * Firestore SDK — so no client-side security rules are required and writes
 * actually persist. One reaction per (reader, issue, page); changing it
 * overwrites, clearing it removes.
 */

/** Set or change the reader's reaction for a page. Returns fresh counts. */
export async function setPageReaction(input: {
  readerId: string;
  issueSlug: string;
  page: number;
  reaction: ReactionKey;
}): Promise<PageReactionCounts> {
  requireReactionsApi();

  const { data } = await apiClient.put(ENDPOINTS.pageReactions.set, input);
  return data.data.counts as PageReactionCounts;
}

/** Remove the reader's reaction for a page. Returns fresh counts. */
export async function clearPageReaction(input: {
  readerId: string;
  issueSlug: string;
  page: number;
}): Promise<PageReactionCounts> {
  requireReactionsApi();

  const { data } = await apiClient.delete(ENDPOINTS.pageReactions.clear, {
    data: input,
  });
  return data.data.counts as PageReactionCounts;
}

/** Fetch the reader's own reaction on a page (or null). */
export async function getOwnReaction(input: {
  readerId: string;
  issueSlug: string;
  page: number;
}): Promise<ReactionKey | null> {
  if (!apiConfig.enabled) return null;

  const { data } = await apiClient.get(ENDPOINTS.pageReactions.own, {
    params: input,
  });
  return (data.data.reaction as ReactionKey | null) ?? null;
}

/** Fetch aggregate reaction counts for a page. */
export async function getPageReactionCounts(input: {
  issueSlug: string;
  page: number;
}): Promise<PageReactionCounts> {
  if (!apiConfig.enabled) return EMPTY_REACTION_COUNTS;

  const { data } = await apiClient.get(ENDPOINTS.pageReactions.counts, {
    params: input,
  });
  return data.data.counts as PageReactionCounts;
}

/**
 * Subscribe to page reaction counts via lightweight polling.
 * Returns an unsubscribe function. Replaces the old Firestore realtime
 * listener — REST is enough at this scale, and writes already return fresh
 * counts so the UI updates instantly on the acting device anyway.
 */
export function subscribePageReactionCounts(
  input: { issueSlug: string; page: number },
  onChange: (counts: PageReactionCounts) => void,
  intervalMs = 20_000,
): () => void {
  if (!apiConfig.enabled) {
    onChange(EMPTY_REACTION_COUNTS);
    return () => {};
  }

  let cancelled = false;

  async function tick() {
    try {
      const counts = await getPageReactionCounts(input);
      if (!cancelled) onChange(counts);
    } catch {
      // Non-fatal — keep the last known counts and retry next tick.
    }
  }

  void tick();
  const timer = window.setInterval(tick, intervalMs);

  return () => {
    cancelled = true;
    window.clearInterval(timer);
  };
}
