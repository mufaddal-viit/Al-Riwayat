import { Router, type ErrorRequestHandler } from "express";
import multer from "multer";

import { requireDashboardSecret } from "../../middleware/requireDashboardSecret";
import { weeklyUploadRateLimiter } from "../../middleware/rateLimiter";
import { uploadAdImage } from "./ads.upload.controller";

// 4 MB — under Vercel's 4.5 MB serverless request-body cap.
const MAX_FILE_BYTES = 4 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: MAX_FILE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only JPEG, PNG, WebP, GIF, or AVIF images are allowed."));
  },
});

const multerErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    const code =
      err.code === "LIMIT_FILE_SIZE"
        ? "FILE_TOO_LARGE"
        : err.code === "LIMIT_FILE_COUNT"
          ? "TOO_MANY_FILES"
          : "UPLOAD_ERROR";
    res.status(400).json({ success: false, message: err.message, code });
    return;
  }
  if (err instanceof Error && err.message.startsWith("Only JPEG")) {
    res.status(400).json({
      success: false,
      message: err.message,
      code: "UNSUPPORTED_FILE_TYPE",
    });
    return;
  }
  next(err);
};

/**
 * Ad creative upload, reached through the admin panel's Next.js BFF with the
 * shared dashboard secret. Single raster image per request; the signature is
 * re-verified in the controller before Cloudinary. Reuses the weekly upload
 * rate limiter (both are admin image uploads).
 */
const router = Router();

router.use(requireDashboardSecret);
router.post(
  "/",
  weeklyUploadRateLimiter,
  upload.single("file"),
  multerErrorHandler,
  uploadAdImage,
);

export default router;
