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
 * Page reactions — 120 writes per IP per 15 minutes.
 * Generous: a reader flipping reactions across many pages is normal;
 * this only exists to blunt scripted abuse.
 */
export const pageReactionRateLimiter = createLimiter(
  15 * 60 * 1000,
  120,
  "page reaction",
);
