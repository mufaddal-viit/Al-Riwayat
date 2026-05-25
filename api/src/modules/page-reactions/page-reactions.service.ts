import * as repo from "./page-reactions.repo.firestore";
import type {
  ClearReactionInput,
  CountsQuery,
  OwnReactionQuery,
  PageReactionCounts,
  ReactionKey,
  SetReactionInput,
} from "./page-reactions.schema";

// Lightweight engagement signal, not core content — always backed by
// Firestore (firebase-admin), which is also the project's default backend.

/** Set or change the reader's reaction, then return fresh page counts. */
export async function setReaction(
  input: SetReactionInput,
): Promise<PageReactionCounts> {
  await repo.setReaction(input);
  return repo.getCounts({ issueSlug: input.issueSlug, page: input.page });
}

/** Clear the reader's reaction, then return fresh page counts. */
export async function clearReaction(
  input: ClearReactionInput,
): Promise<PageReactionCounts> {
  await repo.clearReaction(input);
  return repo.getCounts({ issueSlug: input.issueSlug, page: input.page });
}

/** Aggregate reaction counts for a page. */
export async function getCounts(
  input: CountsQuery,
): Promise<PageReactionCounts> {
  return repo.getCounts(input);
}

/** The reader's own reaction on a page (or null). */
export async function getOwnReaction(
  input: OwnReactionQuery,
): Promise<ReactionKey | null> {
  return repo.getOwnReaction(input);
}
