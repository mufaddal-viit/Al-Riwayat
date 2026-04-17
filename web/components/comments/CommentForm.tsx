"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { CreateCommentInput } from "@/types/comment";

interface CommentFormProps {
  slug: string;
  onSubmit: (input: CreateCommentInput) => Promise<void>;
  isPending: boolean;
}

export function CommentForm({ slug, onSubmit, isPending }: CommentFormProps) {
  const { isAuthenticated, user } = useAuth();

  const [form, setForm] = useState({
    body:     "",
    honeypot: "",
  });
  const [errors, setErrors] = useState<{ body?: string }>({});
  const [status, setStatus] = useState("");
  const [isTransitionPending, startTransition] = useTransition();

  const busy = isPending || isTransitionPending;

  if (!isAuthenticated || !user) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          Sign in
        </Link>{" "}
        to leave a comment.
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");
    setErrors({});

    if (form.honeypot.length > 0) {
      setStatus("Please leave the honeypot field empty.");
      return;
    }

    if (form.body.trim().length < 10) {
      setErrors({ body: "Comment must be at least 10 characters." });
      return;
    }

    startTransition(async () => {
      try {
        await onSubmit({
          body:     form.body.trim(),
          pageSlug: slug,
        });
        setStatus("Comment posted.");
        setForm({ body: "", honeypot: "" });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to submit comment.";
        setStatus(msg);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot — hidden from real users, filled by bots */}
      <input
        type="text"
        name="honeypot"
        value={form.honeypot}
        onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <p className="text-sm text-muted-foreground">
        Posting as{" "}
        <span className="font-medium text-foreground">
          {user.firstName} {user.lastName}
        </span>
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="cf-body">Comment</Label>
        <Textarea
          id="cf-body"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          rows={4}
          placeholder="Share your thoughts…"
          disabled={busy}
          className={cn(
            "resize-none",
            errors.body && "border-destructive focus-visible:ring-destructive",
          )}
        />
        {errors.body && (
          <p className="text-xs text-destructive">{errors.body}</p>
        )}
      </div>

      {status && (
        <p
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            status === "Comment posted."
              ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
        >
          {status}
        </p>
      )}

      <SubmitButton
        icon={MessageSquare}
        label="Post comment"
        pendingLabel="Posting…"
        isPending={busy}
      />
    </form>
  );
}
