import { cn } from "@/lib/utils";
import { MarkdownContent } from "@/components/weekly/markdown-content";
import {
  isAllowedImageSrc,
  type ColumnsBlock,
  type ImageBlock,
  type ImageTextBlock,
  type RichTextBlock,
} from "@/lib/weekly/blocks";

/** Reading-column width — text blocks stay within this; wide/full images break out. */
const READING_WIDTH = "mx-auto max-w-[68ch]";

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
        "mx-auto grid max-w-[68ch] gap-6 sm:gap-8",
        block.count === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
      )}
    >
      {block.cols.map((col, i) =>
        col.trim() ? (
          <MarkdownContent key={i} className="text-base sm:text-base sm:leading-[1.7]">
            {col}
          </MarkdownContent>
        ) : (
          <div key={i} aria-hidden />
        ),
      )}
    </div>
  );
}

/** Caption rendered as plain text — never Markdown/HTML. */
function Caption({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <figcaption className="mt-2 text-center text-sm italic text-muted-foreground">
      {text}
    </figcaption>
  );
}

export function ImageBlockView({ block }: { block: ImageBlock }) {
  if (!isAllowedImageSrc(block.src)) return null;

  const widthClass =
    block.width === "full"
      ? "w-full"
      : block.width === "wide"
        ? "mx-auto w-full max-w-4xl"
        : "w-full max-w-sm";

  const alignClass =
    block.width === "inline"
      ? block.align === "left"
        ? "mr-auto"
        : block.align === "right"
          ? "ml-auto"
          : "mx-auto"
      : "";

  return (
    <figure className={cn(widthClass, alignClass)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- editorial photos have variable, unknown aspect ratios */}
      <img
        src={block.src}
        alt={block.alt}
        loading="lazy"
        decoding="async"
        className="h-auto w-full rounded-2xl object-cover"
      />
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
        "mx-auto grid max-w-4xl items-center gap-6 sm:gap-8 sm:grid-cols-2",
        block.imageSide === "right" && "sm:[&>figure]:order-2",
      )}
    >
      {hasImage && (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element -- editorial photos have variable, unknown aspect ratios */}
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-2xl object-cover"
          />
          <Caption text={block.caption} />
        </figure>
      )}
      {hasText && (
        <MarkdownContent className="text-base sm:text-base sm:leading-[1.7]">
          {block.text}
        </MarkdownContent>
      )}
    </div>
  );
}
