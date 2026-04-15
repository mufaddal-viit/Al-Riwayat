import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Comment, CreateCommentInput } from "@/types/comment";

// ─── Public ───────────────────────────────────────────────────────────────────

/** Fetch approved threaded comments for a page slug */
export async function fetchComments(pageSlug: string): Promise<Comment[]> {
  const { data } = await apiClient.get(ENDPOINTS.comments.list, {
    params: { slug: pageSlug },
  });
  return data.data;
}

/** Submit a new comment or reply (lands in PENDING, requires moderation) */
export async function submitComment(input: CreateCommentInput): Promise<Comment> {
  const { data } = await apiClient.post(ENDPOINTS.comments.create, input);
  return data.data;
}

// ─── Admin (requires ADMIN role) ──────────────────────────────────────────────

/** Approve a pending comment — makes it visible to readers */
export async function approveComment(id: string): Promise<Comment> {
  const { data } = await apiClient.patch(ENDPOINTS["admin.comments"].approve(id));
  return data.data;
}

/** Mark a comment as spam — hides it from readers, keeps it for audit */
export async function markCommentAsSpam(id: string): Promise<Comment> {
  const { data } = await apiClient.patch(ENDPOINTS["admin.comments"].spam(id));
  return data.data;
}

/** Hard-delete a comment and its replies */
export async function deleteComment(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS["admin.comments"].delete(id));
}
