"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types/comment";
import { CommentReply } from "./CommentReply";

interface CommentCardProps {
  comment: Comment;
  slug: string;
  onReplySubmitted: () => void;
}

export function CommentCard({
  comment,
  slug,
  onReplySubmitted,
}: CommentCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showReply, setShowReply] = useState(false);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(comment.createdAt));

  function handleReplyClick() {
    if (!isAuthenticated) {
      // Preserve the current page so the user lands back here after login
      router.push(
        `/login?next=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }
    setShowReply((v) => !v);
  }

  return (
    <Card className="mb-6 shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground h-10 w-10 font-semibold">
              {comment.authorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-base leading-none font-medium">
              {comment.authorName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
          {comment.body}
        </p>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleReplyClick}
            className={cn(
              "h-8 rounded-full px-3 text-xs font-medium transition-colors",
              showReply
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {showReply ? "Cancel" : "Reply"}
          </button>
        </div>

        {showReply && (
          <CommentReply
            parentId={comment.id}
            slug={slug}
            onClose={() => setShowReply(false)}
            onSuccess={() => {
              setShowReply(false);
              onReplySubmitted();
            }}
          />
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-6 ml-12 border-l-2 border-border pl-4 space-y-4">
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                slug={slug}
                onReplySubmitted={onReplySubmitted}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
