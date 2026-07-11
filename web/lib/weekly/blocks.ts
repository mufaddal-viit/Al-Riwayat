/**
 * Weekly Riwayat article body model.
 *
 * The article `body` field is an opaque string on the backend (see
 * `api/src/modules/weekly/weekly.schema.ts`, max 50k chars). We store a JSON
 * document of layout blocks inside it. Legacy articles hold plain Markdown;
 * `parseBody` transparently wraps those as a single rich-text block, so no data
 * migration is needed and old drafts keep rendering.
 *
 * SECURITY: `parseBody` is the trust boundary for stored content. It runs on
 * both the reader page and the admin editor, so it never assumes the JSON is
 * well-formed — every field is validated and image sources are checked against
 * the Cloudinary host allowlist. A tampered or corrupt `body` degrades to a
 * safe fallback rather than injecting arbitrary URLs or crashing the page.
 */

export const WEEKLY_DOC_VERSION = 1 as const;
export const MAX_PHOTOS = 3;
/** Mirrors the backend body cap (weekly.schema.ts). */
export const MAX_BODY_CHARS = 50_000;

export const IMAGE_WIDTHS = ["full", "wide", "inline"] as const;
export const IMAGE_ALIGNS = ["center", "left", "right"] as const;
export const IMAGE_SIDES = ["left", "right"] as const;
export const COLUMN_COUNTS = [2, 3] as const;

export type ImageWidth = (typeof IMAGE_WIDTHS)[number];
export type ImageAlign = (typeof IMAGE_ALIGNS)[number];
export type ImageSide = (typeof IMAGE_SIDES)[number];
export type ColumnCount = (typeof COLUMN_COUNTS)[number];

export interface RichTextBlock {
  type: "richtext";
  md: string;
}

export interface ColumnsBlock {
  type: "columns";
  count: ColumnCount;
  /** One Markdown string per column; length always matches `count`. */
  cols: string[];
}

/**
 * A photo the admin picked but has not saved yet. Held only in editor state —
 * the actual upload to Cloudinary is deferred until the article is saved, so
 * cancelling an edit never leaves an orphaned asset. Never serialized.
 */
export interface PendingImage {
  file: File;
  /** Object URL for local preview; the editor revokes it when replaced. */
  previewUrl: string;
}

export interface ImageBlock {
  type: "image";
  src: string;
  alt: string;
  caption: string;
  width: ImageWidth;
  align: ImageAlign;
  /** Editor-only; present when a not-yet-uploaded file is staged. */
  pending?: PendingImage;
}

export interface ImageTextBlock {
  type: "imageText";
  src: string;
  alt: string;
  caption: string;
  text: string;
  imageSide: ImageSide;
  /** Editor-only; present when a not-yet-uploaded file is staged. */
  pending?: PendingImage;
}

export type Block = RichTextBlock | ColumnsBlock | ImageBlock | ImageTextBlock;

export interface WeeklyDoc {
  version: typeof WEEKLY_DOC_VERSION;
  blocks: Block[];
}

/** Blocks that hold a photo, for the article-wide photo cap. */
const PHOTO_BLOCK_TYPES = new Set(["image", "imageText"]);

/**
 * Allowed image hosts. Uploads only ever produce Cloudinary URLs; anything else
 * in a stored `body` is treated as tampering and dropped at render time.
 */
const CLOUDINARY_HOST = "res.cloudinary.com";

/** True when `src` is an https Cloudinary URL we are willing to render. */
export function isAllowedImageSrc(src: unknown): src is string {
  if (typeof src !== "string" || src.length === 0) return false;
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return false;
  }
  return url.protocol === "https:" && url.hostname === CLOUDINARY_HOST;
}

// ─── Factories ────────────────────────────────────────────────────────────────

export function emptyRichText(md = ""): RichTextBlock {
  return { type: "richtext", md };
}

export function emptyColumns(count: ColumnCount = 2): ColumnsBlock {
  return { type: "columns", count, cols: Array.from({ length: count }, () => "") };
}

export function emptyImage(): ImageBlock {
  return { type: "image", src: "", alt: "", caption: "", width: "wide", align: "center" };
}

export function emptyImageText(): ImageTextBlock {
  return {
    type: "imageText",
    src: "",
    alt: "",
    caption: "",
    text: "",
    imageSide: "left",
  };
}

// ─── Coercion helpers ─────────────────────────────────────────────────────────

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function oneOf<T extends readonly string[] | readonly number[]>(
  value: unknown,
  allowed: T,
  fallback: T[number],
): T[number] {
  return (allowed as readonly unknown[]).includes(value)
    ? (value as T[number])
    : fallback;
}

function coerceBlock(raw: unknown): Block | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;

  switch (b.type) {
    case "richtext":
      return { type: "richtext", md: asString(b.md) };

    case "columns": {
      const count = oneOf(b.count, COLUMN_COUNTS, 2) as ColumnCount;
      const source = Array.isArray(b.cols) ? b.cols : [];
      const cols = Array.from({ length: count }, (_, i) => asString(source[i]));
      return { type: "columns", count, cols };
    }

    case "image": {
      const src = asString(b.src);
      if (!isAllowedImageSrc(src)) return null;
      return {
        type: "image",
        src,
        alt: asString(b.alt),
        caption: asString(b.caption),
        width: oneOf(b.width, IMAGE_WIDTHS, "wide") as ImageWidth,
        align: oneOf(b.align, IMAGE_ALIGNS, "center") as ImageAlign,
      };
    }

    case "imageText": {
      const src = asString(b.src);
      if (!isAllowedImageSrc(src)) return null;
      return {
        type: "imageText",
        src,
        alt: asString(b.alt),
        caption: asString(b.caption),
        text: asString(b.text),
        imageSide: oneOf(b.imageSide, IMAGE_SIDES, "left") as ImageSide,
      };
    }

    default:
      return null;
  }
}

// ─── Parse / serialize ────────────────────────────────────────────────────────

/**
 * Turn a stored `body` string into a validated block list.
 *
 * - Valid block JSON → coerced, host-checked blocks (unknown/tampered ones
 *   dropped), capped at `MAX_PHOTOS` photos.
 * - Anything else (plain Markdown, corrupt JSON, empty) → a single rich-text
 *   block holding the original text. Never throws.
 */
export function parseBody(body: string | null | undefined): WeeklyDoc {
  const text = (body ?? "").trim();
  if (!text) return { version: WEEKLY_DOC_VERSION, blocks: [emptyRichText()] };

  // Only attempt JSON parsing for object-shaped payloads; everything else is
  // legacy Markdown and must be preserved verbatim.
  if (text.startsWith("{")) {
    try {
      const parsed = JSON.parse(text) as unknown;
      if (
        parsed &&
        typeof parsed === "object" &&
        Array.isArray((parsed as { blocks?: unknown }).blocks)
      ) {
        const rawBlocks = (parsed as { blocks: unknown[] }).blocks;
        let photos = 0;
        const blocks: Block[] = [];
        for (const raw of rawBlocks) {
          const block = coerceBlock(raw);
          if (!block) continue;
          if (PHOTO_BLOCK_TYPES.has(block.type)) {
            if (photos >= MAX_PHOTOS) continue;
            photos += 1;
          }
          blocks.push(block);
        }
        if (blocks.length === 0) blocks.push(emptyRichText());
        return { version: WEEKLY_DOC_VERSION, blocks };
      }
    } catch {
      // fall through to legacy handling
    }
  }

  return { version: WEEKLY_DOC_VERSION, blocks: [emptyRichText(text)] };
}

/** Drop editor-only transient fields so a block is safe to persist. */
function stripTransient(block: Block): Block {
  if (block.type === "image" || block.type === "imageText") {
    const { pending: _pending, ...rest } = block;
    return rest;
  }
  return block;
}

/**
 * Serialize blocks into the stored `body` string. Transient fields (staged,
 * not-yet-uploaded files) are stripped — callers must resolve pending uploads
 * with `resolvePendingUploads` before serializing.
 */
export function serializeBody(blocks: Block[]): string {
  const doc: WeeklyDoc = {
    version: WEEKLY_DOC_VERSION,
    blocks: blocks.map(stripTransient),
  };
  return JSON.stringify(doc);
}

/** Count photo-bearing blocks (for the editor's article-wide cap). */
export function countPhotos(blocks: Block[]): number {
  return blocks.filter((b) => PHOTO_BLOCK_TYPES.has(b.type)).length;
}

/** True when the block holds a saved image or a staged (pending) one. */
export function blockHasImage(block: ImageBlock | ImageTextBlock): boolean {
  return Boolean(block.pending) || isAllowedImageSrc(block.src);
}

/** True when any block has a staged file awaiting upload. */
export function hasPendingUploads(blocks: Block[]): boolean {
  return blocks.some(
    (b) => (b.type === "image" || b.type === "imageText") && Boolean(b.pending),
  );
}

/**
 * Upload every staged file, returning blocks whose `src` now points at the
 * uploaded Cloudinary URL and whose `pending` field is cleared. Preview object
 * URLs are revoked. Throws if any upload fails, so the caller can abort the
 * save without persisting half-uploaded state.
 */
export async function resolvePendingUploads(
  blocks: Block[],
  upload: (file: File) => Promise<{ url: string }>,
): Promise<Block[]> {
  return Promise.all(
    blocks.map(async (block) => {
      if (
        (block.type === "image" || block.type === "imageText") &&
        block.pending
      ) {
        const { url } = await upload(block.pending.file);
        URL.revokeObjectURL(block.pending.previewUrl);
        const { pending: _pending, ...rest } = block;
        return { ...rest, src: url } as Block;
      }
      return block;
    }),
  );
}

/** True when the document has at least one block with real content. */
export function hasContent(blocks: Block[]): boolean {
  return blocks.some((b) => {
    switch (b.type) {
      case "richtext":
        return b.md.trim().length > 0;
      case "columns":
        return b.cols.some((c) => c.trim().length > 0);
      case "image":
        return blockHasImage(b);
      case "imageText":
        return blockHasImage(b) || b.text.trim().length > 0;
      default:
        return false;
    }
  });
}
