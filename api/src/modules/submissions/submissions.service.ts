import { uploadBufferToCloudinary } from "../../lib/cloudinary";
import { env } from "../../lib/env";
import * as repo from "./submissions.repo.firestore";
import type { SubmissionInput } from "./submissions.schema";

const submissionSuccessResponse = {
  success: true,
  message: "Submission received.",
} as const;

export async function createSubmission(
  input: SubmissionInput,
  files: Express.Multer.File[],
) {
  if (input.honeypot.trim().length > 0) {
    return submissionSuccessResponse;
  }

  const assets = await Promise.all(
    files.map((file) =>
      uploadBufferToCloudinary(file.buffer, {
        folder: env.CLOUDINARY_UPLOAD_FOLDER,
        filename: file.originalname,
      }),
    ),
  );

  await repo.createSubmission({
    name: input.name,
    age: input.age,
    email: input.email.toLowerCase(),
    submissionType: input.submissionType,
    content: input.content,
    anonymous: input.anonymous,
    assets,
  });

  return submissionSuccessResponse;
}
