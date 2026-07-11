"use client";

import {
  ChevronDown,
  ChevronUp,
  Columns2,
  Image as ImageIcon,
  PanelLeft,
  Plus,
  Trash2,
  Type,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  countPhotos,
  emptyColumns,
  emptyImage,
  emptyImageText,
  emptyRichText,
  MAX_PHOTOS,
  type Block,
} from "@/lib/weekly/blocks";
import { ColumnsBlockEditor } from "./columns-block-editor";
import { ImageBlockEditor } from "./image-block-editor";
import { ImageTextBlockEditor } from "./image-text-block-editor";
import { RichTextBlockEditor } from "./rich-text-block-editor";

interface BlockListEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  disabled?: boolean;
}

const BLOCK_LABEL: Record<Block["type"], string> = {
  richtext: "Text",
  columns: "Columns",
  image: "Image",
  imageText: "Photo + text",
};

const ADD_BUTTONS: {
  type: Block["type"];
  label: string;
  icon: typeof Type;
  isPhoto: boolean;
  make: () => Block;
}[] = [
  { type: "richtext", label: "Text", icon: Type, isPhoto: false, make: emptyRichText },
  { type: "columns", label: "Columns", icon: Columns2, isPhoto: false, make: () => emptyColumns() },
  { type: "image", label: "Image", icon: ImageIcon, isPhoto: true, make: emptyImage },
  { type: "imageText", label: "Photo + text", icon: PanelLeft, isPhoto: true, make: emptyImageText },
];

export function BlockListEditor({
  blocks,
  onChange,
  disabled = false,
}: BlockListEditorProps) {
  const photos = countPhotos(blocks);
  const photosFull = photos >= MAX_PHOTOS;

  function addBlock(make: () => Block) {
    onChange([...blocks, make()]);
  }

  function updateBlock(index: number, next: Block) {
    const copy = blocks.slice();
    copy[index] = next;
    onChange(copy);
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const copy = blocks.slice();
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {blocks.length} block{blocks.length === 1 ? "" : "s"}
        </p>
        <p
          className={cn(
            "text-xs tabular-nums",
            photosFull ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
          )}
        >
          {photos}/{MAX_PHOTOS} photos
        </p>
      </div>

      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-card/40 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {BLOCK_LABEL[block.type]}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={disabled || index === 0}
                  aria-label="Move block up"
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={disabled || index === blocks.length - 1}
                  aria-label="Move block down"
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(index)}
                  disabled={disabled}
                  aria-label="Delete block"
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {block.type === "richtext" && (
              <RichTextBlockEditor
                block={block}
                onChange={(b) => updateBlock(index, b)}
                disabled={disabled}
              />
            )}
            {block.type === "columns" && (
              <ColumnsBlockEditor
                block={block}
                onChange={(b) => updateBlock(index, b)}
                disabled={disabled}
              />
            )}
            {block.type === "image" && (
              <ImageBlockEditor
                block={block}
                onChange={(b) => updateBlock(index, b)}
                disabled={disabled}
              />
            )}
            {block.type === "imageText" && (
              <ImageTextBlockEditor
                block={block}
                onChange={(b) => updateBlock(index, b)}
                disabled={disabled}
              />
            )}
          </div>
        ))}
      </div>

      {/* Add block toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 p-3">
        <span className="mr-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Plus className="h-3.5 w-3.5" />
          Add block
        </span>
        {ADD_BUTTONS.map((btn) => {
          const blocked = btn.isPhoto && photosFull;
          return (
            <Button
              key={btn.type}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock(btn.make)}
              disabled={disabled || blocked}
              title={blocked ? `Photo limit reached (${MAX_PHOTOS})` : undefined}
              className="gap-1.5"
            >
              <btn.icon className="h-3.5 w-3.5" />
              {btn.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
