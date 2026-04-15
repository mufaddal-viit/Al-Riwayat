"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchComments, submitComment } from "@/services/commentService";
import type { Comment, CreateCommentInput } from "@/types/comment";

// ─── useComments ──────────────────────────────────────────────────────────────

interface UseCommentsResult {
  data: Comment[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useComments(pageSlug: string): UseCommentsResult {
  const [data, setData]         = useState<Comment[] | undefined>(undefined);
  const [isLoading, setLoading] = useState(true);
  const [isError, setError]     = useState(false);
  const slugRef                 = useRef(pageSlug);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const comments = await fetchComments(slugRef.current);
      setData(comments);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    slugRef.current = pageSlug;
    load();
  }, [pageSlug, load]);

  return { data, isLoading, isError, refetch: load };
}

// ─── useSubmitComment ─────────────────────────────────────────────────────────

interface UseSubmitCommentResult {
  mutate: (input: CreateCommentInput) => void;
  mutateAsync: (input: CreateCommentInput) => Promise<Comment>;
  isPending: boolean;
  isError: boolean;
  error: string | null;
  reset: () => void;
}

export function useSubmitComment(
  onSuccess?: (comment: Comment, variables: CreateCommentInput) => void,
): UseSubmitCommentResult {
  const [isPending, setPending] = useState(false);
  const [isError, setError]     = useState(false);
  const [error, setErrorMsg]    = useState<string | null>(null);

  function reset() {
    setError(false);
    setErrorMsg(null);
  }

  async function mutateAsync(input: CreateCommentInput): Promise<Comment> {
    setPending(true);
    setError(false);
    setErrorMsg(null);
    try {
      const comment = await submitComment(input);
      onSuccess?.(comment, input);
      return comment;
    } catch (err) {
      setError(true);
      setErrorMsg(err instanceof Error ? err.message : "Failed to submit comment.");
      throw err;
    } finally {
      setPending(false);
    }
  }

  function mutate(input: CreateCommentInput) {
    mutateAsync(input).catch(() => {/* errors surfaced via isError */});
  }

  return { mutate, mutateAsync, isPending, isError, error, reset };
}
