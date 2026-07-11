"use client";

import type { RichTextBlock } from "@/lib/weekly/blocks";
import { MarkdownEditor } from "../markdown-editor";

interface Props {
  block: RichTextBlock;
  onChange: (block: RichTextBlock) => void;
  disabled?: boolean;
}

export function RichTextBlockEditor({ block, onChange, disabled }: Props) {
  return (
    <MarkdownEditor
      value={block.md}
      onChange={(md) => onChange({ ...block, md })}
      disabled={disabled}
    />
  );
}
