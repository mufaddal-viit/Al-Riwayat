import type { Request, Response, NextFunction } from "express";
import type { CookieOptions } from "express";

import { env } from "../../lib/env";
import * as authService from "./auth.service";
import type {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  ResendVerificationInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from "./auth.schema";

// ─── Cookie config ────────────────────────────────────────────────────────────

const REFRESH_COOKIE_NAME = "refresh_token";

function refreshCookieOptions(maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",          // Only sent on /api/auth/* requests
    domain: env.COOKIE_DOMAIN || undefined,
    maxAge: maxAgeMs,
  };
}

const REFRESH_COOKIE_TTL = env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000;

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions(REFRESH_COOKIE_TTL));
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions(0));
}

function extractRefreshToken(req: Request): string | undefined {
  return req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
}

function extractClientMeta(req: Request) {
  return {
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  };
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function register(
  req: Request<Record<string, never>, unknown, RegisterInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(
  req: Request<Record<string, never>, unknown, VerifyEmailInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.verifyEmail(req.body);
    res.status(200).json({ success: true, message: "Email verified successfully." });
  } catch (err) {
    next(err);
  }
}

export async function resendVerification(
  req: Request<Record<string, never>, unknown, ResendVerificationInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.resendVerification(req.body);
    // Always return the same message to prevent email enumeration
    res.status(200).json({
      success: true,
      message: "If your email is registered and unverified, a new link has been sent.",
    });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request<Record<string, never>, unknown, LoginInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.login(req.body, extractClientMeta(req));
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const plainToken = extractRefreshToken(req);
    if (!plainToken) {
      res.status(401).json({
        success: false,
        message: "Refresh token missing.",
        code: "MISSING_REFRESH_TOKEN",
      });
      return;
    }

    const result = await authService.refresh(plainToken, extractClientMeta(req));
    setRefreshCookie(res, result.newRefreshToken);
    res.status(200).json({ success: true, data: { accessToken: result.accessToken } });
  } catch (err) {
    // Clear the cookie on any refresh failure to force re-login
    clearRefreshCookie(res);
    next(err);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const plainToken = extractRefreshToken(req);
    if (plainToken) {
      await authService.logout(plainToken);
    }
    clearRefreshCookie(res);
    res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(
  req: Request<Record<string, never>, unknown, ForgotPasswordInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.forgotPassword(req.body);
    res.status(200).json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(
  req: Request<Record<string, never>, unknown, ResetPasswordInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.resetPassword(req.body);
    clearRefreshCookie(res);
    res.status(200).json({ success: true, message: "Password reset successfully. Please log in again." });
  } catch (err) {
    next(err);
  }
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authService.getMe(req.user!.sub);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(
  req: Request<Record<string, never>, unknown, UpdateProfileInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authService.updateProfile(req.user!.sub, req.body);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(
  req: Request<Record<string, never>, unknown, ChangePasswordInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.changePassword(req.user!.sub, req.body);
    clearRefreshCookie(res);
    res.status(200).json({
      success: true,
      message: "Password changed. Please log in again on all devices.",
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteOwnAccount(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const plainToken = extractRefreshToken(req) ?? "";
    await authService.deleteOwnAccount(req.user!.sub, plainToken);
    clearRefreshCookie(res);
    res.status(200).json({ success: true, message: "Account deleted." });
  } catch (err) {
    next(err);
  }
}
