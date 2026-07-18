"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ACCEPTED_IMAGE_TYPES } from "@/services/weeklyUploadService";

const MAX_FILE_BYTES = 4 * 1024 * 1024;

export interface PendingImage {
  file: File;
  previewUrl: string;
}

interface AdImageFieldProps {
  label: string;
  hint?: string;
  /** Already-uploaded URL (saved), or "". */
  src: string;
  /** Staged file awaiting upload, if any. */
  pending?: PendingImage;
  onChange: (next: { src?: string; pending?: PendingImage }) => void;
  disabled?: boolean;
}

/**
 * Stages one ad image for deferred upload. Nothing is sent to Cloudinary here;
 * the file is previewed locally and uploaded only when the ad is saved, so
 * replacing or cancelling never orphans an asset.
 */
export function AdImageField({
  label,
  hint,
  src,
  pending,
  onChange,
  disabled = false,
}: AdImageFieldProps) {
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
    if (pending) URL.revokeObjectURL(pending.previewUrl);
    onChange({ pending: { file, previewUrl: URL.createObjectURL(file) }, src: "" });
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage() {
    if (pending) URL.revokeObjectURL(pending.previewUrl);
    onChange({ pending: undefined, src: "" });
    setError(null);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium">
        {label}
        {hint && <span className="ml-1 font-normal text-muted-foreground">{hint}</span>}
      </p>

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
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
          <img src={previewSrc} alt="" className="max-h-40 w-full object-cover" />
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
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-background"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-60"
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
          Replace
        </Button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
