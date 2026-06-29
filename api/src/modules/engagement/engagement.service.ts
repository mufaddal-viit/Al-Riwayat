import { AppError } from "../../lib/AppError";
import { env } from "../../lib/env";
import * as firestoreRepo from "./engagement.repo.firestore";
import type { EngagementInput } from "./engagement.schema";

const engagementSuccessResponse = {
  success: true,
  message: "Engagement submission recorded.",
} as const;

export async function createEngagementSubmission(input: EngagementInput) {
  // Bot-filled honeypot → return the same generic success without storing.
  if (input.honeypot.trim().length > 0) {
    return engagementSuccessResponse;
  }

  if (env.DATA_BACKEND !== "firestore") {
    throw new AppError(
      "Engagement submissions require DATA_BACKEND=firestore.",
      500,
      "DATA_BACKEND_UNSUPPORTED",
    );
  }
  await firestoreRepo.createEngagementSubmission(input);
  return engagementSuccessResponse;
}
