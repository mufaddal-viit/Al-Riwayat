import { Timestamp, FieldValue } from "firebase-admin/firestore";

import { AppError } from "../../lib/AppError";
import { getAdminDb } from "../../lib/firebase-admin";

const COLLECTION = "comments";

type Status = "PENDING" | "APPROVED" | "SPAM";

interface StoredComment {
  body: string;
  authorName: string;
  authorEmail: string;
  authorUid: string;
  pageSlug: string;
  parentId: string | null;
  status: Status;
  createdAt: Timestamp;
}

interface PublicComment {
  id: string;
  body: string;
  authorName: string;
  pageSlug: string;
  parentId: string | null;
  status: Status;
  createdAt: string;
}

interface PublicCommentWithReplies extends PublicComment {
  replies: PublicComment[];
}

export interface CreateCommentRepoInput {
  body: string;
  authorName: string;
  authorEmail: string;
  authorUid: string;
  pageSlug: string;
  parentId?: string | null;
  status?: Status;
}

function toPublic(id: string, data: StoredComment): PublicComment {
  return {
    id,
    body: data.body,
    authorName: data.authorName,
    pageSlug: data.pageSlug,
    parentId: data.parentId,
    status: data.status,
    createdAt: data.createdAt.toDate().toISOString(),
  };
}

export async function getApprovedComments(
  slug: string,
): Promise<PublicCommentWithReplies[]> {
  const db = getAdminDb();
  const snap = await db
    .collection(COLLECTION)
    .where("pageSlug", "==", slug)
    .where("status", "==", "APPROVED")
    .get();

  const all = snap.docs.map((d) => toPublic(d.id, d.data() as StoredComment));

  const topLevel = all
    .filter((c) => c.parentId === null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return topLevel.map((c) => ({
    ...c,
    replies: all
      .filter((r) => r.parentId === c.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  }));
}

export async function findCommentById(id: string) {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data() as StoredComment;
  return { id: doc.id, parentId: data.parentId };
}

export async function createComment(
  input: CreateCommentRepoInput,
): Promise<PublicComment> {
  if (input.parentId) {
    const parent = await findCommentById(input.parentId);
    if (!parent) {
      throw new AppError("Parent comment not found.", 404, "PARENT_NOT_FOUND");
    }
    if (parent.parentId !== null) {
      throw new AppError(
        "Replies to replies are not supported.",
        422,
        "NESTED_REPLY_NOT_ALLOWED",
      );
    }
  }

  const db = getAdminDb();
  const docRef = db.collection(COLLECTION).doc();
  const now = FieldValue.serverTimestamp();
  const payload = {
    body: input.body,
    authorName: input.authorName,
    authorEmail: input.authorEmail,
    authorUid: input.authorUid,
    pageSlug: input.pageSlug,
    parentId: input.parentId ?? null,
    status: input.status ?? "APPROVED",
    createdAt: now,
  };

  await docRef.set(payload);
  const created = await docRef.get();
  return toPublic(created.id, created.data() as StoredComment);
}
