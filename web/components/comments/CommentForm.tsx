"use client";

import { useState, useTransition } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
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
    authorName:  "",
    authorEmail: "",
    body:        "",
    honeypot:    "",
  });
  const [errors, setErrors]   = useState<Partial<typeof form>>({});
  const [status, setStatus]   = useState("");
  const [isTransitionPending, startTransition] = useTransition();

  const busy = isPending || isTransitionPending;

  // When logged in, use the authenticated user's details
  const resolvedName  = isAuthenticated ? `${user!.firstName} ${user!.lastName}` : form.authorName;
  const resolvedEmail = isAuthenticated ? user!.email : form.authorEmail;

  function validate(): boolean {
    const next: Partial<typeof form> = {};

    if (!isAuthenticated && resolvedName.trim().length < 2)
      next.authorName = "Name must be at least 2 characters.";

    if (!isAuthenticated && !/\S+@\S+\.\S+/.test(resolvedEmail))
      next.authorEmail = "Please enter a valid email.";

    if (form.body.trim().length < 10)
      next.body = "Comment must be at least 10 characters.";

    if (form.honeypot.length > 0) {
      setStatus("Please leave the honeypot field empty.");
      return false;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");
    setErrors({});
    if (!validate()) return;

    startTransition(async () => {
      try {
        await onSubmit({
          authorName:  resolvedName.trim(),
          authorEmail: resolvedEmail.trim(),
          body:        form.body.trim(),
          pageSlug:    slug,
        });
        setStatus("Comment submitted for review. It will appear once approved.");
        setForm({ authorName: "", authorEmail: "", body: "", honeypot: "" });
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

      {/* Author fields — only shown when not logged in */}
      {isAuthenticated ? (
        <p className="text-sm text-muted-foreground">
          Posting as{" "}
          <span className="font-medium text-foreground">
            {user!.firstName} {user!.lastName}
          </span>
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cf-authorName">Name</Label>
              <Input
                id="cf-authorName"
                value={form.authorName}
                autoComplete="given-name"
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                className={cn(errors.authorName && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.authorName && (
                <p className="text-xs text-destructive">{errors.authorName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cf-authorEmail">Email</Label>
              <Input
                id="cf-authorEmail"
                type="email"
                value={form.authorEmail}
                autoComplete="email"
                onChange={(e) => setForm({ ...form, authorEmail: e.target.value })}
                className={cn(errors.authorEmail && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.authorEmail && (
                <p className="text-xs text-destructive">{errors.authorEmail}</p>
              )}
            </div>
          </div>
        </>
      )}

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
            status.includes("review")
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
