import { apiClient } from "@/lib/api/client";
import { apiConfig } from "@/lib/api/config";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { AppError } from "@/lib/api/error";
import type { Comment, CreateCommentInput } from "@/types/comment";

function requireCommentsApi() {
  if (!apiConfig.enabled) {
    throw new AppError({
      message: "Reader notes are unavailable right now.",
      status: 503,
      code: "API_NOT_CONFIGURED",
    });
  }
}

/** Fetch approved comments for a page slug (e.g. an issue slug). */
export async function fetchComments(pageSlug: string): Promise<Comment[]> {
  if (!apiConfig.enabled) return [];

  const { data } = await apiClient.get(ENDPOINTS.comments.list, {
    params: { slug: pageSlug },
  });
  return data.data;
}

/** Submit a new comment. Open to anyone — author identity is in the input. */
export async function submitComment(
  input: CreateCommentInput,
): Promise<Comment> {
  requireCommentsApi();

  const { data } = await apiClient.post(ENDPOINTS.comments.create, input);
  return data.data;
}
