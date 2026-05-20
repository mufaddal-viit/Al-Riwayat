import { FieldValue } from "firebase-admin/firestore";

import { getAdminDb } from "../../lib/firebase-admin";
import type { EngagementInput } from "./engagement.schema";

const COLLECTION = "engagement_submissions";

export async function createEngagementSubmission(input: EngagementInput) {
  const db = getAdminDb();
  await db.collection(COLLECTION).add({
    name: input.name,
    email: input.email,
    age: input.age,
    occupation: input.occupation,
    subscribeToEmails: input.subscribeToEmails,
    submittedAt: FieldValue.serverTimestamp(),
  });
}
