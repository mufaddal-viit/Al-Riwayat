"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ACCEPTED_IMAGE_TYPES,
  uploadWeeklyImage,
} from "@/services/weeklyUploadService";

interface ImageUploadFieldProps {
  src: string;
  alt: string;
  caption: string;
  onChange: (patch: { src?: string; alt?: string; caption?: string }) => void;
  disabled?: boolean;
}

/**
 * Picks an image file, uploads it to Cloudinary via the admin BFF, and edits
 * its alt text + caption. Alt is required for accessibility and surfaced as a
 * hint when a photo has none.
 */
export function ImageUploadField({
  src,
  alt,
  caption,
  onChange,
  disabled = false,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const { url } = await uploadWeeklyImage(file);
      onChange({ src: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {src ? (
        <div className="relative overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of a variable-aspect upload */}
          <img src={src} alt={alt} className="max-h-56 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange({ src: "" })}
            disabled={disabled || uploading}
            aria-label="Remove image"
            className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-foreground shadow-sm transition-colors hover:bg-background"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <ImagePlus className="h-5 w-5" />
              Upload image
            </>
          )}
        </button>
      )}

      {src && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
        >
          Replace image
        </Button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {src && (
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
