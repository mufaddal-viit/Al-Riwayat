import rateLimit from "express-rate-limit";

const rateLimitResponse = (action: string) => ({
  success: false,
  message: `Too many ${action} attempts. Please try again later.`,
  code: "RATE_LIMITED",
});

/**
 * Strict limiter for login and forgot-password endpoints.
 * 5 attempts per IP per 15 minutes.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse("login"),
  skipSuccessfulRequests: true, // only count failed attempts
});

/**
 * Registration limiter — 10 accounts per IP per hour.
 * Loose enough for shared IPs (offices, universities) but limits abuse.
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse("registration"),
});

/**
 * Token refresh limiter — 60 per IP per 15 minutes.
 * High enough not to disrupt legitimate usage (tabs, mobile apps)
 * but prevents brute-force token farming.
 */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse("token refresh"),
  skipSuccessfulRequests: false,
});

/**
 * General auth limiter for lower-risk endpoints
 * (verify-email, resend-verification, reset-password).
 */
export const generalAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse("requests"),
});
