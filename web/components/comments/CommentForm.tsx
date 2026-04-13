"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreateCommentInput } from "@/types/comment";
import { cn } from "@/lib/utils";

interface CommentFormErrors {
  authorName?: string;
  authorEmail?: string;
  body?: string;
}

interface CommentFormProps {
  slug: string;
  onSubmit: (input: CreateCommentInput) => Promise<void>;
  isPending: boolean;
}

export function CommentForm({ slug, onSubmit, isPending }: CommentFormProps) {
  const [formData, setFormData] = useState({
    authorName: "",
    authorEmail: "",
    body: "",
    honeypot: "",
  });
  const [errors, setErrors] = useState<CommentFormErrors>({});
  const [status, setStatus] = useState("");

  const [isTransitionPending, startTransition] = useTransition();

  const validate = (): boolean => {
    const newErrors: CommentFormErrors = {};

    if (formData.authorName.length < 2) {
      newErrors.authorName = "Name must be at least 2 characters.";
    }

    if (!/\S+@\S+\.\S+/.test(formData.authorEmail)) {
      newErrors.authorEmail = "Please enter a valid email.";
    }

    if (formData.body.length < 10) {
      newErrors.body = "Comment must be at least 10 characters.";
    }

    if (formData.honeypot.length > 0) {
      setStatus("Please leave the honeypot field empty.");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    setErrors({});

    if (!validate()) return;

    const input: CreateCommentInput = {
      authorName: formData.authorName.trim(),
      authorEmail: formData.authorEmail.trim(),
      body: formData.body.trim(),
      pageSlug: slug,
    };

    startTransition(async () => {
      try {
        await onSubmit(input);
        setStatus(
          "Comment submitted for review. It will appear once approved.",
        );
        setFormData({
          authorName: "",
          authorEmail: "",
          body: "",
          honeypot: "",
        });
      } catch (error: any) {
        const msg = error.message || "Failed to submit comment.";
        setStatus(msg);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="honeypot"
        value={formData.honeypot}
        onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
      />
      <div>
        <Label htmlFor="authorName">Name</Label>
        <Input
          id="authorName"
          value={formData.authorName}
          onChange={(e) =>
            setFormData({ ...formData, authorName: e.target.value })
          }
          className={cn(
            errors.authorName &&
              "border-destructive focus-visible:ring-destructive",
          )}
        />
        {errors.authorName && (
          <p className="text-sm text-destructive mt-1">{errors.authorName}</p>
        )}
      </div>
      <div>
        <Label htmlFor="authorEmail">Email</Label>
        <Input
          id="authorEmail"
          type="email"
          value={formData.authorEmail}
          onChange={(e) =>
            setFormData({ ...formData, authorEmail: e.target.value })
          }
          className={cn(
            errors.authorEmail &&
              "border-destructive focus-visible:ring-destructive",
          )}
        />
        {errors.authorEmail && (
          <p className="text-sm text-destructive mt-1">{errors.authorEmail}</p>
        )}
      </div>
      <div>
        <Label htmlFor="body">Comment</Label>
        <Textarea
          id="body"
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          rows={4}
          placeholder="Share your thoughts..."
          className={cn(
            errors.body && "border-destructive focus-visible:ring-destructive",
          )}
        />
        {errors.body && (
          <p className="text-sm text-destructive mt-1">{errors.body}</p>
        )}
      </div>
      {status && (
        <div
          className={`p-3 rounded-md text-sm border ${
            status.includes("review")
              ? "bg-green-100 border-green-200 text-green-800"
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}
        >
          {status}
        </div>
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={isPending || isTransitionPending}
      >
        {isPending || isTransitionPending ? "Posting..." : "Post Comment"}
      </Button>
    </form>
  );
}
