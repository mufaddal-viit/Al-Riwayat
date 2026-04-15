"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { submitComment } from "@/services/commentService";
import { AppError } from "@/lib/api/error";
import { Reply } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";

interface CommentReplyProps {
  parentId: string;
  slug: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CommentReply({ parentId, slug, onClose, onSuccess }: CommentReplyProps) {
  const { user } = useAuth();
  const [body, setBody]       = useState("");
  const [error, setError]     = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (body.trim().length < 10) {
      setError("Reply must be at least 10 characters.");
      return;
    }

    startTransition(async () => {
      try {
        await submitComment({
          body: body.trim(),
          authorName:  `${user!.firstName} ${user!.lastName}`,
          authorEmail: user!.email,
          pageSlug:    slug,
          parentId,
        });
        onSuccess();
      } catch (err) {
        setError(
          err instanceof AppError
            ? err.message
            : "Failed to submit reply. Please try again.",
        );
      }
    });
  }

  return (
    <div className="mt-4 rounded-xl border border-border/60 bg-muted/40 p-4 ml-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Replying as{" "}
          <span className="text-foreground">
            {user?.firstName} {user?.lastName}
          </span>
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cancel reply"
          className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your reply…"
          rows={3}
          autoFocus
          disabled={isPending}
          className="resize-none"
        />

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <SubmitButton
            icon={Reply}
            label="Post reply"
            pendingLabel="Posting…"
            isPending={isPending}
            size="sm"
            className="w-auto"
          />
        </div>
      </form>
    </div>
  );
}
