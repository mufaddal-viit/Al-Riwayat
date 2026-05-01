"use client";

import { CommentCard } from "./CommentCard";
import type { Comment } from "@/types/comment";

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  return (
    <>
      {/* Scoped scrollbar styles */}
      <style jsx>{`
        .thin-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .thin-scrollbar::-webkit-scrollbar-thumb {
          background-color: #9ca3af;
          border-radius: 9999px;
        }
        .thin-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #9ca3af transparent;
        }
      `}</style>

      <ul
        className="max-h-[420px] divide-y divide-border overflow-y-auto thin-scrollbar"
        aria-label="Reader notes"
      >
        {comments.map((comment) => (
          <li key={comment.id}>
            <CommentCard comment={comment} />
          </li>
        ))}
      </ul>
    </>
  );
}
