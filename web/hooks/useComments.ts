import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchComments, submitComment } from "@/services/commentService";
import type { Comment, CreateCommentInput } from "@/types/comment";

export function useComments(pageSlug: string) {
  return useQuery({
    queryKey: ["comments", pageSlug],
    queryFn: () => fetchComments(pageSlug),
  });
}

export function useSubmitComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitComment,
    onSuccess: (newComment, variables) => {
      // invalidate and refetch comments for the page
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.pageSlug],
      });
    },
  });
}
