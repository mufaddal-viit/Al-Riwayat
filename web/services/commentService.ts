import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Comment, CreateCommentInput } from "@/types/comment";

/** Fetch approved comments for a page slug (e.g. an issue slug). */
export async function fetchComments(pageSlug: string): Promise<Comment[]> {
  const { data } = await apiClient.get(ENDPOINTS.comments.list, {
    params: { slug: pageSlug },
  });
  return data.data;
}

/** Submit a new comment. Open to anyone — author identity is in the input. */
export async function submitComment(
  input: CreateCommentInput,
): Promise<Comment> {
  const { data } = await apiClient.post(ENDPOINTS.comments.create, input);
  return data.data;
}
