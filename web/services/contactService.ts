import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ContactInput, ContactResponse } from "@/types/api";

export async function submitContactForm(
  input: ContactInput,
): Promise<ContactResponse> {
  const { data } = await apiClient.post(ENDPOINTS.contact.submit, input);
  return data;
}
