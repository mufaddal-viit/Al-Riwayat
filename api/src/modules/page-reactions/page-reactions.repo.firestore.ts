import { FieldValue } from "firebase-admin/firestore";

import { getAdminDb } from "../../lib/firebase-admin";
import {
  emptyCounts,
  REACTION_KEYS,
  type PageReactionCounts,
  type ReactionKey,
} from "./page-reactions.schema";

const COLLECTION = "page_reactions";

// One doc per (reader, issue, page) — flipping the reaction overwrites it,
// removing it clears it. Keeps the "one reaction per page per device" rule.
function docId(readerId: string, issueSlug: string, page: number): string {
  return `${readerId}__${issueSlug}__p${page}`;
}

interface StoredReaction {
  issueSlug: string;
  page: number;
  reaction: ReactionKey;
  readerId: string;
}

/** Set or change the reader's reaction for a page. */
export async function setReaction(input: {
  readerId: string;
  issueSlug: string;
  page: number;
  reaction: ReactionKey;
}): Promise<void> {
  const db = getAdminDb();
  await db
    .collection(COLLECTION)
    .doc(docId(input.readerId, input.issueSlug, input.page))
    .set({
      issueSlug: input.issueSlug,
      page: input.page,
      reaction: input.reaction,
      readerId: input.readerId,
      createdAt: FieldValue.serverTimestamp(),
    });
}

/** Remove the reader's reaction for a page. */
export async function clearReaction(input: {
  readerId: string;
  issueSlug: string;
  page: number;
}): Promise<void> {
  const db = getAdminDb();
  await db
    .collection(COLLECTION)
    .doc(docId(input.readerId, input.issueSlug, input.page))
    .delete();
}

/** Fetch the reader's own reaction on a page (or null). */
export async function getOwnReaction(input: {
  readerId: string;
  issueSlug: string;
  page: number;
}): Promise<ReactionKey | null> {
  const db = getAdminDb();
  const snap = await db
    .collection(COLLECTION)
    .doc(docId(input.readerId, input.issueSlug, input.page))
    .get();
  if (!snap.exists) return null;
  return (snap.data() as StoredReaction).reaction ?? null;
}

/**
 * Aggregate counts for a page, computed from its reaction docs.
 * Fine for current scale; swap to a maintained aggregate doc if it gets hot.
 */
export async function getCounts(input: {
  issueSlug: string;
  page: number;
}): Promise<PageReactionCounts> {
  const db = getAdminDb();
  const snap = await db
    .collection(COLLECTION)
    .where("issueSlug", "==", input.issueSlug)
    .where("page", "==", input.page)
    .get();

  const counts = emptyCounts();
  snap.forEach((d) => {
    const reaction = (d.data() as StoredReaction).reaction;
    if (REACTION_KEYS.includes(reaction)) {
      counts[reaction] += 1;
    }
  });
  return counts;
}
