import rateLimit from "express-rate-limit";

const fifteenMinutesInMs = 15 * 60 * 1000;

function createWriteLimiter() {
  return rateLimit({
    windowMs: fifteenMinutesInMs,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please try again later."
    }
  });
}

export const contactRateLimiter = createWriteLimiter();
export const newsletterRateLimiter = createWriteLimiter();
