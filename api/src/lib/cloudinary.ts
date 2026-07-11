import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

import { AppError } from "./AppError";
import { env } from "./env";

let configured = false;

function ensureConfigured() {
  if (configured) return;

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new AppError(
      "Cloudinary credentials are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      500,
      "CLOUDINARY_NOT_CONFIGURED",
    );
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  configured = true;
}

export interface UploadedAsset {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    filename?: string;
    /**
     * Constrain the asset kind. Defaults to "auto"; pass "image" to reject
     * anything Cloudinary would otherwise ingest as raw/video/pdf.
     */
    resourceType?: "auto" | "image";
  },
): Promise<UploadedAsset> {
  ensureConfigured();

  return new Promise<UploadedAsset>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType ?? "auto",
        use_filename: Boolean(options.filename),
        unique_filename: true,
        filename_override: options.filename,
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(
            error ??
              new AppError(
                "Cloudinary upload returned no result.",
                502,
                "CLOUDINARY_UPLOAD_FAILED",
              ),
          );
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          bytes: result.bytes,
        });
      },
    );

    stream.end(buffer);
  });
}
