"use client";

import { CommentCard } from "./CommentCard";
import type { Comment } from "@/types/comment";

interface CommentListProps {
  comments: Comment[];
  slug: string;
  onReplySubmitted: () => void;
}

export function CommentList({ comments, slug, onReplySubmitted }: CommentListProps) {
  if (!comments.length) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No notes yet. Be the first to share your thoughts.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          slug={slug}
          onReplySubmitted={onReplySubmitted}
        />
      ))}
    </div>
  );
}
