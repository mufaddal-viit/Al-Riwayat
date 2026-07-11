import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../lib/AppError";
import { uploadBufferToCloudinary } from "../../lib/cloudinary";
import { detectImageType } from "../../lib/imageSignature";

/**
 * Accept a single admin-uploaded image and store it in the Cloudinary `weekly`
 * folder. The buffer's real signature is verified before upload — the client
 * Content-Type is never trusted — and only raster images are allowed through.
 * Returns just the public URL and id; the raw Cloudinary response is not leaked.
 */
export async function uploadWeeklyImage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      throw new AppError("No image file provided.", 400, "NO_FILE");
    }

    const detected = detectImageType(file.buffer);
    if (!detected) {
      throw new AppError(
        "Unsupported image. Upload a JPEG, PNG, WebP, GIF, or AVIF file.",
        400,
        "UNSUPPORTED_IMAGE",
      );
    }

    const asset = await uploadBufferToCloudinary(file.buffer, {
      folder: "weekly",
      filename: file.originalname,
      resourceType: "image",
    });

    res.status(201).json({
      success: true,
      data: { url: asset.url, publicId: asset.publicId },
    });
  } catch (err) {
    next(err);
  }
}
