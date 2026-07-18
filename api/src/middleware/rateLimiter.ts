import rateLimit from "express-rate-limit";

function createLimiter(
  windowMs: number,
  max: number,
  action: string,
  extra?: Partial<Parameters<typeof rateLimit>[0]>,
) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: `Too many ${action} requests. Please try again later.`,
      code: "RATE_LIMITED",
    },
    ...extra,
  });
}

/** Contact form — 5 submissions per IP per 15 minutes */
export const contactRateLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  "contact form",
);

/** Newsletter — 5 subscriptions per IP per 15 minutes */
export const newsletterRateLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  "newsletter subscription",
);

/** Engagement form — 5 submissions per IP per 15 minutes */
export const engagementRateLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  "engagement",
);

/**
 * Comment submission — 10 per IP per 15 minutes.
 * Loose enough for genuine readers; tight enough to deter spam bots.
 */
export const commentRateLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "comment submission",
);

/** Contribute submissions — 3 per IP per hour (uploads are expensive) */
export const submissionRateLimiter = createLimiter(
  60 * 60 * 1000,
  3,
  "contribute submission",
);

/**
 * Weekly editor image uploads — 40 per IP per 15 minutes.
 * Comfortable for an editor placing up to 3 photos across several drafts,
 * tight enough that a compromised admin session cannot hammer Cloudinary.
 */
export const weeklyUploadRateLimiter = createLimiter(
  15 * 60 * 1000,
  40,
  "image upload",
);

/**
 * Ad event ingestion — 300 batches per IP per 15 minutes. Generous (a reader
 * genuinely browsing several pages fires many batched events) but enough to
 * blunt scripted inflation.
 */
export const adEventsRateLimiter = createLimiter(
  15 * 60 * 1000,
  300,
  "ad event",
);

/**
 * Page reactions — 120 writes per IP per 15 minutes.
 * Generous: a reader flipping reactions across many pages is normal;
 * this only exists to blunt scripted abuse.
 */
export const pageReactionRateLimiter = createLimiter(
  15 * 60 * 1000,
  120,
  "page reaction",
);
