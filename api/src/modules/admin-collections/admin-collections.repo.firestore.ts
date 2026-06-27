import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getAdminDb } from "../../lib/firebase-admin";

/**
 * Generic Firestore admin operations shared by the dashboard moderation tabs
 * (comments, contacts, newsletter, reactions, engagement). All writes go
 * through `firebase-admin` (server-only, service-account auth) — the browser
 * never touches Firestore directly.
 */

export type AdminJsonValue =
  | string
  | number
  | boolean
  | null
  | AdminJsonValue[]
  | { [key: string]: AdminJsonValue };

export interface AdminCollectionDoc {
  id: string;
  data: Record<string, AdminJsonValue>;
}

function serialize(value: unknown): AdminJsonValue {
  if (value === undefined || value === null) return null;
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce<
      Record<string, AdminJsonValue>
    >((acc, [key, nested]) => {
      acc[key] = serialize(nested);
      return acc;
    }, {});
  }
  return String(value);
}

function serializeDoc(
  doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot,
): AdminCollectionDoc {
  const raw = doc.data() ?? {};
  const data = Object.entries(raw).reduce<Record<string, AdminJsonValue>>(
    (acc, [key, value]) => {
      acc[key] = serialize(value);
      return acc;
    },
    {},
  );
  return { id: doc.id, data };
}

const dateFieldFor: Record<string, string> = {
  comments: "createdAt",
  contacts: "createdAt",
  newsletter: "createdAt",
  engagement_submissions: "submittedAt",
  page_reactions: "createdAt",
};

/** List a collection (optionally filtered by an equality on one field). */
export async function listCollection(
  collection: string,
  filter?: { field: string; value: string },
): Promise<AdminCollectionDoc[]> {
  const db = getAdminDb();
  let query: FirebaseFirestore.Query = db.collection(collection);
  if (filter) {
    query = query.where(filter.field, "==", filter.value);
  }
  const snap = await query.get();
  const dateField = dateFieldFor[collection] ?? "createdAt";

  return snap.docs
    .map(serializeDoc)
    .sort((a, b) => {
      const left = String(a.data[dateField] ?? "");
      const right = String(b.data[dateField] ?? "");
      return right.localeCompare(left);
    });
}

export async function getDoc(
  collection: string,
  id: string,
): Promise<AdminCollectionDoc | null> {
  const db = getAdminDb();
  const doc = await db.collection(collection).doc(id).get();
  return doc.exists ? serializeDoc(doc) : null;
}

/** Patch fields on a document. Returns null if the doc is missing. */
export async function updateDoc(
  collection: string,
  id: string,
  patch: Record<string, unknown>,
): Promise<AdminCollectionDoc | null> {
  const db = getAdminDb();
  const ref = db.collection(collection).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;

  await ref.update({ ...patch, updatedAt: FieldValue.serverTimestamp() });
  const updated = await ref.get();
  return serializeDoc(updated);
}

export async function deleteDoc(
  collection: string,
  id: string,
): Promise<AdminCollectionDoc | null> {
  const db = getAdminDb();
  const ref = db.collection(collection).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;

  const snapshot = serializeDoc(existing);
  await ref.delete();
  return snapshot;
}
