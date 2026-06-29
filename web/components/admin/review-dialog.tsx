"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import type {
  AdminContribution,
  PublishPayload,
} from "@/services/adminContributionsService";
import type { ContributionCategory } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const CATEGORIES: ContributionCategory[] = [
  "Story",
  "Poetry",
  "Reflection",
  "Art",
];

const SUBMISSION_TYPE_TO_CATEGORY: Record<string, ContributionCategory> = {
  STORY: "Story",
  POEM: "Poetry",
  ART: "Art",
};

export type ReviewMode = "publish" | "edit" | "view";

interface ReviewDialogProps {
  contribution: AdminContribution | null;
  mode: ReviewMode;
  onClose: () => void;
  onSaved: () => void;
  publish: (id: string, payload: PublishPayload) => Promise<AdminContribution>;
  update: (
    id: string,
    payload: Partial<PublishPayload>,
  ) => Promise<AdminContribution>;
}

const MODE_COPY: Record<ReviewMode, { title: string; cta: string }> = {
  publish: { title: "Review & publish", cta: "Publish to live page" },
  edit: { title: "Edit contribution", cta: "Save changes" },
  view: { title: "View contribution", cta: "" },
};

/**
 * Admin review flow: set a title, lightly edit the body, choose a category,
 * mark featured — the original visitor content is never destroyed.
 *
 * - publish: validates a title and sets status → published.
 * - edit:    saves display-field edits to an existing contribution.
 * - view:    read-only display of the stored content.
 */
export function ReviewDialog({
  contribution,
  mode,
  onClose,
  onSaved,
  publish,
  update,
}: ReviewDialogProps) {
  const readOnly = mode === "view";
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ContributionCategory>("Story");
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featured, setFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seed the form whenever a new contribution is opened.
  useEffect(() => {
    if (!contribution) return;
    setTitle(
      contribution.title && contribution.title !== "Untitled contribution"
        ? contribution.title
        : "",
    );
    setCategory(
      contribution.category ??
        SUBMISSION_TYPE_TO_CATEGORY[contribution.submissionType] ??
        "Story",
    );
    setBody(contribution.body || contribution.originalContent || "");
    setExcerpt(contribution.excerpt ?? "");
    setFeatured(contribution.featured ?? false);
    setError(null);
  }, [contribution]);

  async function handleSubmit() {
    if (!contribution || readOnly) return;
    if (title.trim().length < 3) {
      setError("Please provide a title (at least 3 characters).");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload: PublishPayload = {
        title: title.trim(),
        category,
        editedContent: body.trim(),
        featured,
      };
      const trimmedExcerpt = excerpt.trim();
      if (trimmedExcerpt.length >= 20) payload.excerpt = trimmedExcerpt;

      if (mode === "publish") {
        await publish(contribution.id, payload);
      } else {
        await update(contribution.id, payload);
      }
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : mode === "publish"
            ? "Could not publish."
            : "Could not save changes.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={Boolean(contribution)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {MODE_COPY[mode].title}
          </DialogTitle>
        </DialogHeader>

        {contribution && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Submitted by{" "}
              <span className="font-medium text-foreground">
                {contribution.anonymous ? "Anonymous" : contribution.author}
              </span>{" "}
              ({contribution.authorEmail}) · original type{" "}
              {contribution.submissionType}
            </p>

            <div className="space-y-2">
              <Label htmlFor="review-title">Title</Label>
              <Input
                id="review-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Give this piece a title"
                disabled={submitting || readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCategory(option)}
                    disabled={submitting || readOnly}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                      category === option
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-body">
                Body{" "}
                <span className="font-normal text-muted-foreground">
                  (lightly edit for clarity — original is preserved)
                </span>
              </Label>
              <Textarea
                id="review-body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className="min-h-[200px]"
                disabled={submitting || readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-excerpt">
                Excerpt{" "}
                <span className="font-normal text-muted-foreground">
                  (optional — auto-generated if blank)
                </span>
              </Label>
              <Textarea
                id="review-excerpt"
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                className="min-h-[80px]"
                placeholder="A short preview shown on the contributions grid"
                disabled={submitting || readOnly}
              />
            </div>

            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) => setFeatured(event.target.checked)}
                disabled={submitting || readOnly}
                className="h-4 w-4 rounded border-border accent-[color:var(--primary)]"
              />
              Feature this contribution on the page
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
              >
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
              >
                {readOnly ? "Close" : "Cancel"}
              </Button>
              {!readOnly && (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {submitting ? "Saving..." : MODE_COPY[mode].cta}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
