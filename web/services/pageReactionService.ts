import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  deleteDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type ReactionKey = "love" | "wow" | "think" | "bookmark" | "inspire";

export interface PageReactionDoc {
  issueSlug: string;
  page: number;
  reaction: ReactionKey;
  readerId: string;
  createdAt: unknown;
}

export type PageReactionCounts = Record<ReactionKey, number>;

const COLLECTION = "page_reactions";

// One doc per (reader, issue, page) — flipping the reaction overwrites it,
// removing clears it. This keeps the "one per page per device" rule.
function docId(readerId: string, issueSlug: string, page: number): string {
  return `${readerId}__${issueSlug}__p${page}`;
}

/** Set or change the reader's reaction for a given page. */
export async function setPageReaction(input: {
  readerId: string;
  issueSlug: string;
  page: number;
  reaction: ReactionKey;
}): Promise<void> {
  const { readerId, issueSlug, page, reaction } = input;
  const ref = doc(db, COLLECTION, docId(readerId, issueSlug, page));
  await setDoc(ref, {
    issueSlug,
    page,
    reaction,
    readerId,
    createdAt: serverTimestamp(),
  });
}

/** Remove the reader's reaction for a given page. */
export async function clearPageReaction(input: {
  readerId: string;
  issueSlug: string;
  page: number;
}): Promise<void> {
  const { readerId, issueSlug, page } = input;
  const ref = doc(db, COLLECTION, docId(readerId, issueSlug, page));
  await deleteDoc(ref);
}

/** Fetch the reader's own reaction on this page (or null). */
export async function getOwnReaction(input: {
  readerId: string;
  issueSlug: string;
  page: number;
}): Promise<ReactionKey | null> {
  const { readerId, issueSlug, page } = input;
  const ref = doc(db, COLLECTION, docId(readerId, issueSlug, page));
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as PageReactionDoc;
  return data.reaction;
}

/**
 * Subscribe to live counts for a page. Returns an unsubscribe.
 * Computes counts client-side from the page's reaction docs — fine for the
 * scale we're at; if this grows hot, swap to a Cloud Function-maintained
 * aggregate doc.
 */
export function subscribePageReactionCounts(
  input: { issueSlug: string; page: number },
  onChange: (counts: PageReactionCounts) => void,
): Unsubscribe {
  const { issueSlug, page } = input;
  const q = query(
    collection(db, COLLECTION),
    where("issueSlug", "==", issueSlug),
    where("page", "==", page),
  );
  return onSnapshot(q, (snap) => {
    const counts: PageReactionCounts = {
      love: 0,
      wow: 0,
      think: 0,
      bookmark: 0,
      inspire: 0,
    };
    snap.forEach((d) => {
      const data = d.data() as PageReactionDoc;
      if (data.reaction in counts) {
        counts[data.reaction] += 1;
      }
    });
    onChange(counts);
  });
}
