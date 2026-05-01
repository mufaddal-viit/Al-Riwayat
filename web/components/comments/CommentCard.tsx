"use client";

import type { Comment } from "@/types/comment";

interface CommentCardProps {
  comment: Comment;
}

export function CommentCard({ comment }: CommentCardProps) {
  const formattedDate = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(comment.createdAt));

  return (
    <article className="px-4 py-4 sm:px-5 sm:py-5">
      <header className="mb-2 flex items-baseline justify-between gap-3">
        <span className="truncate text-[13px] font-semibold text-primary">
          {comment.authorName}
        </span>
        <span className="shrink-0 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          {formattedDate}
        </span>
      </header>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
        {comment.body}
      </p>
    </article>
  );
}
