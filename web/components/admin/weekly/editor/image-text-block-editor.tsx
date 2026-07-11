"use client";

import { Label } from "@/components/ui/label";
import {
  IMAGE_SIDES,
  type ImageSide,
  type ImageTextBlock,
} from "@/lib/weekly/blocks";
import { MarkdownEditor } from "../markdown-editor";
import { ImageUploadField } from "./image-upload-field";
import { Segmented } from "./segmented";

interface Props {
  block: ImageTextBlock;
  onChange: (block: ImageTextBlock) => void;
  disabled?: boolean;
}

const SIDE_LABELS: Record<ImageSide, string> = {
  left: "Image left",
  right: "Image right",
};

export function ImageTextBlockEditor({ block, onChange, disabled }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-xs">Photo + text</Label>
        <Segmented<ImageSide>
          aria-label="Image placement"
          value={block.imageSide}
          onChange={(imageSide) => onChange({ ...block, imageSide })}
          disabled={disabled}
          options={IMAGE_SIDES.map((s) => ({ value: s, label: SIDE_LABELS[s] }))}
        />
      </div>

      <ImageUploadField
        src={block.src}
        pending={block.pending}
        alt={block.alt}
        caption={block.caption}
        onChange={(patch) => onChange({ ...block, ...patch })}
        disabled={disabled}
      />

      <div className="space-y-1.5">
        <Label className="text-[11px] text-muted-foreground">Text</Label>
        <MarkdownEditor
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
