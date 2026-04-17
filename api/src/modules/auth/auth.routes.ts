import { Router } from "express";

import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/requireAuth";
import {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
  generalAuthLimiter,
} from "../../middleware/authRateLimiter";
import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "./auth.schema";
import * as authController from "./auth.controller";

const router = Router();

// ─── Public routes ────────────────────────────────────────────────────────────

router.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  authController.register,
);

router.post(
  "/verify-email",
  generalAuthLimiter,
  validate(verifyEmailSchema),
  authController.verifyEmail,
);

router.post(
  "/resend-verification",
  generalAuthLimiter,
  validate(resendVerificationSchema),
  authController.resendVerification,
);

router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  authController.login,
);

router.post(
  "/google",
  loginLimiter,
  validate(googleLoginSchema),
  authController.googleLogin,
);

router.post("/refresh", refreshLimiter, authController.refresh);

router.post(
  "/forgot-password",
  loginLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

router.post(
  "/reset-password",
  generalAuthLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);

// ─── Authenticated routes ─────────────────────────────────────────────────────

router.get("/me", requireAuth, authController.getMe);

router.patch(
  "/me",
  requireAuth,
  validate(updateProfileSchema),
  authController.updateProfile,
);

router.patch(
  "/me/password",
  requireAuth,
  validate(changePasswordSchema),
  authController.changePassword,
);

router.post("/logout", requireAuth, authController.logout);

router.delete("/me", requireAuth, authController.deleteOwnAccount);

export default router;
