"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchComments, submitComment } from "@/services/commentService";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";
import type { Comment, CreateCommentInput } from "@/types/comment";
import { SubmitButton } from "@/components/ui/submit-button";
import { PenLine, X } from "lucide-react";

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
      // silently fail — empty state is acceptable
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
      // Submitted comments are PENDING — no need to add them to the list.
      // Just close the form and let the user know via the form's own status message.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-border shadow-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Reader Notes</CardTitle>
          <span className="text-muted-foreground text-lg font-normal">
            ({comments.length})
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ) : (
          <>
            <CommentList
              comments={comments}
              slug={slug}
              onReplySubmitted={loadComments}
            />

            <SubmitButton
              type="button"
              icon={showForm ? X : PenLine}
              label={showForm ? "Cancel" : "Leave a note"}
              pendingLabel="Leave a note"
              onClick={() => setShowForm((v) => !v)}
              variant={showForm ? "outline" : "default"}
            />

            {showForm && (
              <CommentForm
                slug={slug}
                onSubmit={handleSubmit}
                isPending={isSubmitting}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
