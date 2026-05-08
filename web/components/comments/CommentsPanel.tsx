"use client";

import { MessageSquare, User } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Comment, CreateCommentInput } from "@/types/comment";

import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

interface CommentsPanelProps {
  slug: string;
  comments: Comment[];
  loading: boolean;
  showForm: boolean;
  isSubmitting: boolean;
  onOpenForm: () => void;
  onCloseForm: () => void;
  onSubmit: (input: CreateCommentInput) => Promise<void>;
}

export function CommentsPanel({
  slug,
  comments,
  loading,
  showForm,
  isSubmitting,
  onOpenForm,
  onCloseForm,
  onSubmit,
}: CommentsPanelProps) {
  const hasComments = comments.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card mt-10">
      {/* List / empty / loading */}
      {loading ? (
        <div className="space-y-3 px-5 py-6">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ) : !hasComments ? (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center sm:py-14">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted-foreground">
            <MessageSquare className="h-5 w-5" aria-hidden />
          </div>
          <p className="max-w-[18rem] text-sm leading-relaxed text-muted-foreground">
            No notes yet. Be the first to say something worth reading.
          </p>
        </div>
      ) : (
        <CommentList comments={comments} />
      )}

      {/* Expanded form */}
      {showForm ? (
        <div className={cn(hasComments && "border-t border-border")}>
          <CommentForm
            slug={slug}
            onSubmit={onSubmit}
            onCancel={onCloseForm}
            isPending={isSubmitting}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenForm}
          className={cn(
            "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
            "hover:bg-muted/40",
            "sm:px-5 sm:py-4",
            hasComments && "border-t border-border",
          )}
          aria-label="Leave a note"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
            <User className="h-4 w-4" aria-hidden />
          </span>
          <span className="flex-1 truncate text-sm text-muted-foreground">
            Say something worth reading…
          </span>
          {/* <span className="rounded-md bg-primary px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
            Post
          </span> */}
        </button>
      )}
    </div>
  );
}
