"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchComments, submitComment } from "@/services/commentService";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";
import type { Comment, CreateCommentInput } from "@/types/comment";

interface CommentsSectionProps {
  slug: string;
}

export function CommentsSection({ slug }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        const data = await fetchComments(slug);
        setComments(data);
      } catch (error) {
        console.error("Failed to load comments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [slug]);

  const handleSubmit = async (input: CreateCommentInput) => {
    try {
      setIsSubmitting(true);
      const newComment = await submitComment(input);
      setComments([newComment, ...comments]);
      setShowForm(false);
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/50">
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
            <CommentList comments={comments} slug={slug} />
            <Button
              onClick={() => setShowForm(!showForm)}
              variant="outline"
              className="w-full"
            >
              {showForm ? "Cancel" : "Add Comment"}
            </Button>
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
