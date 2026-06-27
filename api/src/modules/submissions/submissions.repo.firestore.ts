import { FieldValue } from "firebase-admin/firestore";

import { getAdminDb } from "../../lib/firebase-admin";
import type { SubmissionType } from "./submissions.schema";

const COLLECTION = "submissions";

export interface StoredAsset {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
}

export interface CreateSubmissionRepoInput {
  name: string;
  age: number | null;
  email: string;
  submissionType: SubmissionType;
  content: string;
  anonymous: boolean;
  assets: StoredAsset[];
}

export async function createSubmission(input: CreateSubmissionRepoInput) {
  const db = getAdminDb();
  const ref = await db.collection(COLLECTION).add({
    name: input.name,
    age: input.age,
    email: input.email,
    submissionType: input.submissionType,
    content: input.content,
    anonymous: input.anonymous,
    assets: input.assets,
    // Moderation lifecycle: every new visitor submission enters the review
    // queue as "pending" until an admin publishes or rejects it. See the
    // contributions module for the admin-facing moderation + publish flow.
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
  });
  return { id: ref.id };
}
