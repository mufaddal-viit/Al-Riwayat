"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send, X } from "lucide-react";

import { getReaderIdentity } from "@/lib/reader-identity";
import { cn } from "@/lib/utils";
import type { CreateCommentInput } from "@/types/comment";

interface CommentFormProps {
  slug: string;
  onSubmit: (input: CreateCommentInput) => Promise<void>;
  onCancel?: () => void;
  isPending: boolean;
}

const BODY_MAX = 2000;

export function CommentForm({
  slug,
  onSubmit,
  onCancel,
  isPending,
}: CommentFormProps) {
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState("");
  const [isTransitionPending, startTransition] = useTransition();
  const hasPrefilledRef = useRef(false);

  const busy = isPending || isTransitionPending;
  const canSend = body.trim().length > 0 && !busy;

  // Prefill the author name from the engagement modal capture exactly once.
  // A ref (not state) is used so the effect can run on mount + when identity
  // becomes available later, without ever overwriting what the user types.
  useEffect(() => {
    if (hasPrefilledRef.current) return;
    const identity = getReaderIdentity();
    if (identity?.name) {
      hasPrefilledRef.current = true;
      setAuthorName((current) => current || identity.name);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");

    if (busy) return; // hard guard against double-submit while a send is in flight
    if (honeypot.length > 0) return;
    if (body.trim().length === 0) return;

    const trimmedName = authorName.trim() || "Anonymous";
    const trimmedBody = body.trim();

    startTransition(async () => {
      try {
        await onSubmit({
          authorName: trimmedName,
          body: trimmedBody,
          pageSlug: slug,
        });
        setBody("");
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to submit comment.";
        setStatus(msg);
      }
    });
  }

  const inputBase =
    "w-full bg-transparent border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 placeholder:text-muted-foreground/70 disabled:opacity-60";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-1 bg-muted/20 px-4 py-4 sm:px-5"
      noValidate
    >
      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        name="honeypot"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {/* Name */}
      <input
        id="cf-name"
        type="text"
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        placeholder="Your name (or stay anonymous)"
        autoComplete="name"
        disabled={busy}
        aria-label="Your name"
        className={cn(
          inputBase,
          "py-1 text-[13px] font-medium text-foreground/80 placeholder:font-normal",
        )}
      />

      <textarea
        id="cf-body"
        value={body}
        onChange={(e) => {
          if (e.target.value.length <= BODY_MAX) setBody(e.target.value);
        }}
        placeholder="Say something worth reading…"
        disabled={busy}
        autoFocus
        rows={3}
        aria-label="Your note"
        className={cn(
          inputBase,
          "resize-none py-1 text-[15px] leading-relaxed text-foreground",
        )}
      />

      {status && (
        <p className="text-xs text-destructive">{status}</p>
      )}

      <div className="flex items-center justify-end gap-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            aria-label="Cancel"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground",
              "disabled:opacity-50",
            )}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send note"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full transition-all",
            canSend
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "bg-muted text-muted-foreground/60",
          )}
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </form>
  );
}
