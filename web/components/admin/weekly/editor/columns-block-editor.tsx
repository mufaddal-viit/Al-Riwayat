"use client";

import { Label } from "@/components/ui/label";
import {
  COLUMN_COUNTS,
  type ColumnCount,
  type ColumnsBlock,
} from "@/lib/weekly/blocks";
import { MarkdownEditor } from "../markdown-editor";
import { Segmented } from "./segmented";

interface Props {
  block: ColumnsBlock;
  onChange: (block: ColumnsBlock) => void;
  disabled?: boolean;
}

export function ColumnsBlockEditor({ block, onChange, disabled }: Props) {
  function setCount(count: ColumnCount) {
    // Preserve existing text; grow with empties or trim extras.
    const cols = Array.from({ length: count }, (_, i) => block.cols[i] ?? "");
    onChange({ ...block, count, cols });
  }

  function setColumn(index: number, md: string) {
    const cols = block.cols.slice();
    cols[index] = md;
    onChange({ ...block, cols });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-xs">Columns</Label>
        <Segmented<ColumnCount>
          aria-label="Number of columns"
          value={block.count}
          onChange={setCount}
          disabled={disabled}
          options={COLUMN_COUNTS.map((n) => ({ value: n, label: `${n} columns` }))}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {block.cols.map((col, i) => (
          <div key={i} className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">
              Column {i + 1}
            </Label>
            <MarkdownEditor
              value={col}
              onChange={(md) => setColumn(i, md)}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
