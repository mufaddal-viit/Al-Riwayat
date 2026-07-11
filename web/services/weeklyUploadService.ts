export interface UploadedWeeklyImage {
  url: string;
  publicId: string;
}

const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB — under Vercel's serverless body cap
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

/**
 * Upload one editor image through the admin BFF to Cloudinary. Does a fast
 * client-side type/size check for UX; the server re-validates authoritatively.
 */
export async function uploadWeeklyImage(file: File): Promise<UploadedWeeklyImage> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, WebP, GIF, or AVIF image.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Image is too large (max 4 MB).");
  }

  const form = new FormData();
  form.append("file", file);

  const response = await fetch("/api/admin/weekly-upload", {
    method: "POST",
    body: form,
  });

  const payload = (await response.json().catch(() => ({}))) as {
    data?: UploadedWeeklyImage;
    message?: string;
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? "Could not upload the image.");
  }
  return payload.data;
}
