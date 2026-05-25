import { FieldValue } from "firebase-admin/firestore";

import { getAdminDb } from "../../lib/firebase-admin";

const COLLECTION = "contacts";

export interface CreateContactRepoInput {
  name: string;
  email: string;
  message: string;
}

export async function createContactSubmission(input: CreateContactRepoInput) {
  const db = getAdminDb();
  await db.collection(COLLECTION).add({
    name: input.name,
    email: input.email,
    message: input.message,
    createdAt: FieldValue.serverTimestamp(),
  });
}
