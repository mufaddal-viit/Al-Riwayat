import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export type SubmissionType = "POEM" | "STORY" | "ART";

export interface SubmissionPayload {
  name: string;
  age: string;
  email: string;
  submissionType: SubmissionType;
  content: string;
  anonymous: boolean;
  files: File[];
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
}

export async function submitContribution(
  payload: SubmissionPayload,
): Promise<SubmissionResponse> {
  const formData = new FormData();
  formData.append("name", payload.name);
  if (payload.age) formData.append("age", payload.age);
  formData.append("email", payload.email);
  formData.append("submissionType", payload.submissionType);
  formData.append("content", payload.content);
  formData.append("anonymous", String(payload.anonymous));
  for (const file of payload.files) {
    formData.append("files", file);
  }

  const { data } = await apiClient.post<SubmissionResponse>(
    ENDPOINTS.submissions.submit,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}
