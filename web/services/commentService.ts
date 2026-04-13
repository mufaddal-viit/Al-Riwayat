import { apiClient } from "@/lib/api/client";
import type { Comment, CreateCommentInput } from "@/types/comment";

/** Fetch approved threaded comments for page */
export async function fetchComments(pageSlug: string): Promise<Comment[]> {
  const { data } = await apiClient.get("/comments", {
    params: { slug: pageSlug },
  });
  return data.data;
}

/** Submit new comment or reply (pending status) */
export async function submitComment(
  input: CreateCommentInput,
): Promise<Comment> {
  const { data } = await apiClient.post("/comments", input);
  return data.data;
}

/** Delete comment (admin) */
export async function deleteComment(id: string): Promise<void> {
  await apiClient.delete(`/comments/${id}`);
}

/** Approve comment (admin) */
export async function approveComment(id: string): Promise<Comment> {
  const { data } = await apiClient.patch(`/comments/${id}/approve`);
  return data.data;
}
