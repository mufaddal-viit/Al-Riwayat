"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types/comment";
import { CommentReply } from "./CommentReply";

interface CommentCardProps {
  comment: Comment;
  slug: string;
}

export function CommentCard({ comment, slug }: CommentCardProps) {
  const [showReply, setShowReply] = useState(false);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(comment.createdAt));

  const avatarInitial = comment.authorName.charAt(0).toUpperCase();

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground h-10 w-10 font-semibold">
              {avatarInitial}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReply(!showReply)}
            className="h-8 px-2 text-xs"
          >
            Reply
          </Button>
        </div>
        {showReply && (
          <CommentReply
            parentId={comment.id}
            slug={slug}
            onClose={() => setShowReply(false)}
          />
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-6 ml-12 border-l-2 border-border pl-4">
            {comment.replies.map((reply) => (
              <CommentCard key={reply.id} comment={reply} slug={slug} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
