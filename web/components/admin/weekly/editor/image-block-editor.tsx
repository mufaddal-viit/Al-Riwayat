"use client";

import { Label } from "@/components/ui/label";
import {
  IMAGE_ALIGNS,
  IMAGE_WIDTHS,
  type ImageAlign,
  type ImageBlock,
  type ImageWidth,
} from "@/lib/weekly/blocks";
import { ImageUploadField } from "./image-upload-field";
import { Segmented } from "./segmented";

interface Props {
  block: ImageBlock;
  onChange: (block: ImageBlock) => void;
  disabled?: boolean;
}

const WIDTH_LABELS: Record<ImageWidth, string> = {
  full: "Full bleed",
  wide: "Wide",
  inline: "Inline",
};

const ALIGN_LABELS: Record<ImageAlign, string> = {
  center: "Center",
  left: "Left",
  right: "Right",
};

export function ImageBlockEditor({ block, onChange, disabled }: Props) {
  return (
    <div className="space-y-4">
      <ImageUploadField
        src={block.src}
        pending={block.pending}
        alt={block.alt}
        caption={block.caption}
        onChange={(patch) => onChange({ ...block, ...patch })}
        disabled={disabled}
      />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Size</Label>
          <Segmented<ImageWidth>
            aria-label="Image size"
            value={block.width}
            onChange={(width) => onChange({ ...block, width })}
            disabled={disabled}
            options={IMAGE_WIDTHS.map((w) => ({ value: w, label: WIDTH_LABELS[w] }))}
          />
        </div>

        {block.width === "inline" && (
          <div className="flex items-center gap-2">
            <Label className="text-xs">Align</Label>
            <Segmented<ImageAlign>
              aria-label="Image alignment"
              value={block.align}
              onChange={(align) => onChange({ ...block, align })}
              disabled={disabled}
              options={IMAGE_ALIGNS.map((a) => ({ value: a, label: ALIGN_LABELS[a] }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
