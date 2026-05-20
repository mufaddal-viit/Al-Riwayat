import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export interface EngagementInput {
  name: string;
  email: string;
  age: number;
  occupation: string;
  subscribeToEmails: boolean;
}

export interface EngagementResponse {
  success: boolean;
  message?: string;
}

export async function submitEngagement(
  input: EngagementInput,
): Promise<EngagementResponse> {
  const { data } = await apiClient.post<EngagementResponse>(
    ENDPOINTS.engagement.submit,
    input,
  );
  return data;
}
