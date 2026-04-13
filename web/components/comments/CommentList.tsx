"use client";

import { CommentCard } from "./CommentCard";
import type { Comment } from "@/types/comment";

interface CommentListProps {
  comments: Comment[];
  slug: string;
}

export function CommentList({ comments, slug }: CommentListProps) {
  if (!comments.length) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No comments yet. Be the first to comment.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} slug={slug} />
      ))}
    </div>
  );
}
