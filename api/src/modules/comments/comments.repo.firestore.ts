import { Timestamp, FieldValue } from "firebase-admin/firestore";

import { getAdminDb } from "../../lib/firebase-admin";

const COLLECTION = "comments";

type Status = "PENDING" | "APPROVED" | "SPAM";

interface StoredComment {
  body: string;
  authorName: string;
  pageSlug: string;
  status: Status;
  createdAt: Timestamp;
}

interface PublicComment {
  id: string;
  body: string;
  authorName: string;
  pageSlug: string;
  status: Status;
  createdAt: string;
}

export interface CreateCommentRepoInput {
  body: string;
  authorName: string;
  pageSlug: string;
  status?: Status;
}

function toPublic(id: string, data: StoredComment): PublicComment {
  return {
    id,
    body: data.body,
    authorName: data.authorName,
    pageSlug: data.pageSlug,
    status: data.status,
    createdAt: data.createdAt.toDate().toISOString(),
  };
}

export async function getApprovedComments(
  slug: string,
): Promise<PublicComment[]> {
  const db = getAdminDb();
  const snap = await db
    .collection(COLLECTION)
    .where("pageSlug", "==", slug)
    .where("status", "==", "APPROVED")
    .get();

  return snap.docs
    .map((d) => toPublic(d.id, d.data() as StoredComment))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createComment(
  input: CreateCommentRepoInput,
): Promise<PublicComment> {
  const db = getAdminDb();
  const docRef = db.collection(COLLECTION).doc();
  await docRef.set({
    body: input.body,
    authorName: input.authorName,
    pageSlug: input.pageSlug,
    status: input.status ?? "APPROVED",
    createdAt: FieldValue.serverTimestamp(),
  });
  const created = await docRef.get();
  return toPublic(created.id, created.data() as StoredComment);
}
