import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { NewsletterResponse } from "@/types/api";

export async function subscribeToNewsletter(
  email: string,
): Promise<NewsletterResponse> {
  const { data } = await apiClient.post(ENDPOINTS.newsletter.subscribe, {
    email,
  });
  return data;
}
