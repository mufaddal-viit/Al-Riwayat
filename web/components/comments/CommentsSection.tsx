"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchComments, submitComment } from "@/services/commentService";
import type { Comment, CreateCommentInput } from "@/types/comment";

import { CommentsHeader } from "./CommentsHeader";
import { CommentsPanel } from "./CommentsPanel";

interface CommentsSectionProps {
  slug: string;
}

export function CommentsSection({ slug }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setComments(await fetchComments(slug));
    } catch {
      // empty state is acceptable
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function handleSubmit(input: CreateCommentInput) {
    try {
      setSubmitting(true);
      await submitComment(input);
      setShowForm(false);
      await loadComments();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-label="Reader notes" className="w-full">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-12 xl:gap-16">
        <CommentsHeader count={comments.length} />
        <CommentsPanel
          slug={slug}
          comments={comments}
          loading={loading}
          showForm={showForm}
          isSubmitting={isSubmitting}
          onOpenForm={() => setShowForm(true)}
          onCloseForm={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  );
}
