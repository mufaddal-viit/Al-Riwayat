import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { UpdateProfileInput, UserProfile } from "@/types/user-profile";

export async function fetchMyProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get(ENDPOINTS.me.get);
  return data.data;
}

export async function updateMyProfile(
  input: UpdateProfileInput,
): Promise<UserProfile> {
  const { data } = await apiClient.patch(ENDPOINTS.me.update, input);
  return data.data;
}

export async function addBookmark(slug: string): Promise<UserProfile> {
  const { data } = await apiClient.post(ENDPOINTS.me.addBookmark(slug));
  return data.data;
}

export async function removeBookmark(slug: string): Promise<UserProfile> {
  const { data } = await apiClient.delete(ENDPOINTS.me.removeBookmark(slug));
  return data.data;
}

export async function addFavourite(slug: string): Promise<UserProfile> {
  const { data } = await apiClient.post(ENDPOINTS.me.addFavourite(slug));
  return data.data;
}

export async function removeFavourite(slug: string): Promise<UserProfile> {
  const { data } = await apiClient.delete(ENDPOINTS.me.removeFavourite(slug));
  return data.data;
}
