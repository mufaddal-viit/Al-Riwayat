import { Router, type ErrorRequestHandler } from "express";
import multer from "multer";

import { submissionRateLimiter } from "../../middleware/rateLimiter";
import { submitContribution } from "./submissions.controller";

const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: MAX_FILES,
    fileSize: MAX_FILE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image and video files are allowed."));
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
    res.status(400).json({
      success: false,
      message: err.message,
      code,
    });
    return;
  }
  if (err instanceof Error && err.message.startsWith("Only image and video")) {
    res.status(400).json({
      success: false,
      message: err.message,
      code: "UNSUPPORTED_FILE_TYPE",
    });
    return;
  }
  next(err);
};

const router = Router();

router.post(
  "/",
  submissionRateLimiter,
  upload.array("files", MAX_FILES),
  multerErrorHandler,
  submitContribution,
);

export default router;
