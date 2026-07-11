"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PendingImage } from "@/lib/weekly/blocks";
import { ACCEPTED_IMAGE_TYPES } from "@/services/weeklyUploadService";

const MAX_FILE_BYTES = 4 * 1024 * 1024; // matches server cap

interface ImageUploadFieldProps {
  /** Already-uploaded Cloudinary URL, or "" if none saved yet. */
  src: string;
  /** Staged local file awaiting upload, if any. */
  pending?: PendingImage;
  alt: string;
  caption: string;
  onChange: (patch: {
    src?: string;
    pending?: PendingImage;
    alt?: string;
    caption?: string;
  }) => void;
  disabled?: boolean;
}

/**
 * Stages an image for upload. The file is NOT sent to Cloudinary here — it is
 * held locally with an object-URL preview and only uploaded when the article is
 * saved. This means replacing or cancelling never leaves an orphaned asset.
 */
export function ImageUploadField({
  src,
  pending,
  alt,
  caption,
  onChange,
  disabled = false,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const previewSrc = pending?.previewUrl || src;
  const hasImage = Boolean(previewSrc);

  function stageFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Choose a JPEG, PNG, WebP, GIF, or AVIF image.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("Image is too large (max 4 MB).");
      return;
    }
    // Revoke a previously-staged preview before replacing it.
    if (pending) URL.revokeObjectURL(pending.previewUrl);
    const previewUrl = URL.createObjectURL(file);
    // Clearing `src` marks the old saved image as replaced; it is never
    // uploaded again, and the new file takes its place on save.
    onChange({ pending: { file, previewUrl }, src: "" });
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage() {
    if (pending) URL.revokeObjectURL(pending.previewUrl);
    onChange({ pending: undefined, src: "" });
    setError(null);
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        disabled={disabled}
        onChange={(e) => stageFile(e.target.files?.[0])}
      />

      {hasImage ? (
        <div className="relative overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of a variable-aspect image */}
          <img src={previewSrc} alt={alt} className="max-h-56 w-full object-cover" />
          {pending && (
            <span className="absolute left-2 top-2 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
              Uploads on save
            </span>
          )}
          <button
            type="button"
            onClick={removeImage}
            disabled={disabled}
            aria-label="Remove image"
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm transition-colors hover:bg-background"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-60"
        >
          <ImagePlus className="h-5 w-5" />
          Choose image
        </button>
      )}

      {hasImage && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          Replace image
        </Button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {hasImage && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">
              Alt text{" "}
              <span className="font-normal text-muted-foreground">
                (describe the image)
              </span>
            </Label>
            <Input
              value={alt}
              onChange={(e) => onChange({ alt: e.target.value })}
              placeholder="e.g. Volunteers packing food parcels"
              disabled={disabled}
            />
            {!alt.trim() && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Add alt text so screen readers can describe this photo.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Caption{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              value={caption}
              onChange={(e) => onChange({ caption: e.target.value })}
              placeholder="Shown beneath the image"
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  );
}
