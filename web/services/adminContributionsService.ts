import type { ContributionCategory } from "@/types/api";

export type ModerationStatus = "pending" | "published" | "rejected";

/** Matches the backend AdminContribution serialization. */
export interface AdminContribution {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: ContributionCategory;
  status: ModerationStatus;
  publishedAt: string;
  createdAt: string;
  excerpt: string;
  body: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  featured: boolean;
  authorEmail: string;
  anonymous: boolean;
  originalContent: string;
  submissionType: string;
}

export interface PublishPayload {
  title: string;
  category?: ContributionCategory;
  editedContent?: string;
  excerpt?: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  featured?: boolean;
}

async function parse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as {
    data?: T;
    message?: string;
  };
  if (!response.ok) {
    throw new Error(data.message ?? "Request failed.");
  }
  return data.data as T;
}

export async function listAdminContributions(
  status?: ModerationStatus,
): Promise<AdminContribution[]> {
  const query = status ? `?status=${status}` : "";
  const response = await fetch(`/api/admin/contributions${query}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  return parse<AdminContribution[]>(response);
}

export async function publishContribution(
  id: string,
  payload: PublishPayload,
): Promise<AdminContribution> {
  const response = await fetch(`/api/admin/contributions/${id}/publish`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parse<AdminContribution>(response);
}

export async function rejectContribution(
  id: string,
): Promise<AdminContribution> {
  const response = await fetch(`/api/admin/contributions/${id}/reject`, {
    method: "PATCH",
  });
  return parse<AdminContribution>(response);
}

export async function unpublishContribution(
  id: string,
): Promise<AdminContribution> {
  const response = await fetch(`/api/admin/contributions/${id}/unpublish`, {
    method: "PATCH",
  });
  return parse<AdminContribution>(response);
}
