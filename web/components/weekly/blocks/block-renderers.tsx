import { cn } from "@/lib/utils";
import { MarkdownContent } from "@/components/weekly/markdown-content";
import {
  isAllowedImageSrc,
  type ColumnsBlock,
  type ImageBlock,
  type ImageTextBlock,
  type RichTextBlock,
} from "@/lib/weekly/blocks";

/**
 * Reading-column width. Blocks assume they render inside a horizontally-padded
 * parent (the article `container`), so they add no gutter of their own; wide/
 * full images break out of the reading column but stay within that padding.
 */
const READING_WIDTH = "mx-auto w-full max-w-[75ch]";

export function RichTextBlockView({
  block,
  dropCap = false,
}: {
  block: RichTextBlock;
  dropCap?: boolean;
}) {
  if (!block.md.trim()) return null;
  return (
    <div className={READING_WIDTH}>
      <MarkdownContent dropCap={dropCap}>{block.md}</MarkdownContent>
    </div>
  );
}

export function ColumnsBlockView({ block }: { block: ColumnsBlock }) {
  const filled = block.cols.filter((c) => c.trim().length > 0);
  if (filled.length === 0) return null;

  return (
    <div
      className={cn(
        // Single column on phones (readable line length); split only once there
        // is room. 3-way splits wait for large screens so lines never get tiny.
        "mx-auto grid w-full max-w-[75ch] gap-6 sm:gap-8",
        block.count === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2",
      )}
    >
      {block.cols.map((col, i) =>
        col.trim() ? (
          <MarkdownContent key={i} className="text-base leading-relaxed sm:text-base sm:leading-[1.7] lg:text-base">
            {col}
          </MarkdownContent>
        ) : (
          <div key={i} aria-hidden className="hidden sm:block" />
        ),
      )}
    </div>
  );
}

/** Caption rendered as plain text — never Markdown/HTML. */
function Caption({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <figcaption className="mt-2 text-center text-sm italic leading-snug text-muted-foreground">
      {text}
    </figcaption>
  );
}

/**
 * Image with a muted placeholder background so the row's space is visibly
 * reserved while the photo loads (limits layout shift). `object-cover` keeps
 * the frame stable; `max-w-full` guarantees no horizontal overflow on phones.
 */
function BlockImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element -- editorial photos have variable, unknown aspect ratios */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-auto w-full max-w-full object-cover"
      />
    </div>
  );
}

export function ImageBlockView({ block }: { block: ImageBlock }) {
  if (!isAllowedImageSrc(block.src)) return null;

  // "full" breaks out to the edge of the article container on phones (negative
  // gutter), then settles into a wide centered frame on larger screens.
  const widthClass =
    block.width === "full"
      ? "-mx-4 w-[calc(100%+2rem)] sm:mx-auto sm:w-full sm:max-w-4xl"
      : block.width === "wide"
        ? "mx-auto w-full max-w-4xl"
        : "w-full max-w-sm";

  const alignClass =
    block.width === "inline"
      ? block.align === "left"
        ? "sm:mr-auto"
        : block.align === "right"
          ? "sm:ml-auto"
          : "mx-auto"
      : "";

  return (
    <figure className={cn(widthClass, alignClass)}>
      <BlockImage src={block.src} alt={block.alt} />
      <Caption text={block.caption} />
    </figure>
  );
}

export function ImageTextBlockView({ block }: { block: ImageTextBlock }) {
  const hasImage = isAllowedImageSrc(block.src);
  const hasText = block.text.trim().length > 0;
  if (!hasImage && !hasText) return null;

  return (
    <div
      className={cn(
        // Stacks vertically on phones (image first, then text); side-by-side
        // only from `sm` up where there is width for both.
        "mx-auto grid w-full max-w-4xl items-center gap-6 sm:gap-8 sm:grid-cols-2",
        block.imageSide === "right" && "sm:[&>figure]:order-2",
      )}
    >
      {hasImage && (
        <figure>
          <BlockImage src={block.src} alt={block.alt} />
          <Caption text={block.caption} />
        </figure>
      )}
      {hasText && (
        <MarkdownContent className="text-base leading-relaxed sm:text-base sm:leading-[1.7] lg:text-base">
          {block.text}
        </MarkdownContent>
      )}
    </div>
  );
}
