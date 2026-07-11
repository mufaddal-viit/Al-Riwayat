/**
 * Raster image sniffing by magic bytes.
 *
 * The client-supplied MIME type is not trustworthy — a `.png` can carry an
 * HTML/JS payload. Before an admin upload reaches Cloudinary we confirm the
 * buffer's real signature is a raster image we allow. SVG is intentionally
 * excluded: it is XML and a stored-XSS vector via embedded `<script>`.
 */

export type DetectedImage = "jpeg" | "png" | "webp" | "gif" | "avif";

function startsWith(buf: Buffer, bytes: number[], offset = 0): boolean {
  if (buf.length < offset + bytes.length) return false;
  return bytes.every((b, i) => buf[offset + i] === b);
}

/**
 * Return the detected raster type, or null if the buffer is not one of the
 * allowed image formats.
 */
export function detectImageType(buf: Buffer): DetectedImage | null {
  // JPEG: FF D8 FF
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return "jpeg";

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "png";
  }

  // GIF: "GIF87a" or "GIF89a"
  if (startsWith(buf, [0x47, 0x49, 0x46, 0x38])) return "gif";

  // RIFF-based container: "RIFF"...."WEBP"
  if (
    startsWith(buf, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(buf, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return "webp";
  }

  // AVIF / HEIF: ISO-BMFF "ftyp" box with an avif/heic brand.
  if (startsWith(buf, [0x66, 0x74, 0x79, 0x70], 4)) {
    const brand = buf.subarray(8, 12).toString("latin1");
    if (["avif", "avis", "heic", "heix", "mif1", "msf1"].includes(brand)) {
      return "avif";
    }
  }

  return null;
}
