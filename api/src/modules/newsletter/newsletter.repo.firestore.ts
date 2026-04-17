import { FieldValue } from "firebase-admin/firestore";

import { getAdminDb } from "../../lib/firebase-admin";

const COLLECTION = "newsletter";

export interface CreateNewsletterRepoInput {
  email: string;
}

/**
 * Create a newsletter subscription, keyed by email.
 * Duplicate emails are a no-op (idempotent to match the original Prisma behavior
 * where a unique-violation is swallowed into the same success response).
 */
export async function createNewsletterSubscription(
  input: CreateNewsletterRepoInput,
) {
  const db = getAdminDb();
  const docRef = db.collection(COLLECTION).doc(input.email.toLowerCase());
  const existing = await docRef.get();

  if (existing.exists) return;

  await docRef.set({
    email: input.email,
    createdAt: FieldValue.serverTimestamp(),
  });
}
