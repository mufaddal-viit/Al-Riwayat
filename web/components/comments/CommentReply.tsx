"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CommentForm } from "./CommentForm";

interface CommentReplyProps {
  parentId: string;
  slug: string;
  onClose: () => void;
}

export function CommentReply({ parentId, slug, onClose }: CommentReplyProps) {
  return (
    <div className="mt-4 p-4 bg-muted/50 rounded-lg border ml-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
          Reply
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <CommentForm
        slug={slug}
        onSubmit={async (input) => {
          // parentId for reply
          const replyInput = { ...input, parentId };
          // service call handled in parent
          console.log("Reply submitted:", replyInput);
        }}
        isPending={false}
      />
    </div>
  );
}
