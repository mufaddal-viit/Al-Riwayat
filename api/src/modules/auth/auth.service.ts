import crypto from "crypto";

import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";

import { AppError } from "../../lib/AppError";
import { prisma } from "../../lib/prisma";
import {
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  signAccessToken,
} from "./token.service";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./email.service";
import type {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  ResendVerificationInput,
} from "./auth.schema";

// ─── Constants ────────────────────────────────────────────────────────────────

const BCRYPT_ROUNDS = 12;
const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000;     // 24 hours
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;          // 1 hour
const GENERIC_AUTH_ERROR = "Invalid email or password."; // never leak existence

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip passwordHash before returning a user to any caller. */
export type SafeUser = Omit<User, "passwordHash">;

function toSafeUser(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...safe } = user;
  return safe;
}

function hashOneTimeToken(plainToken: string): string {
  return crypto.createHash("sha256").update(plainToken).digest("hex");
}

function generateOneTimeToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

interface TokenMeta {
  userAgent?: string;
  ipAddress?: string;
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function register(input: RegisterInput): Promise<void> {
  const { firstName, lastName, email, password } = input;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Constant-time response — never reveal whether an email is registered
    throw new AppError(
      "An account with this email already exists.",
      409,
      "EMAIL_TAKEN",
    );
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: { firstName, lastName, email, passwordHash },
  });

  // Issue and send verification token
  const plainToken = generateOneTimeToken();
  const tokenHash = hashOneTimeToken(plainToken);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFY_TTL_MS);

  await prisma.emailVerificationToken.create({
    data: { tokenHash, userId: user.id, expiresAt },
  });

  // Fire-and-forget: don't fail registration if email delivery fails
  sendVerificationEmail(email, plainToken).catch((err) =>
    console.error("[auth] Failed to send verification email.", err),
  );
}

// ─── Verify Email ─────────────────────────────────────────────────────────────

export async function verifyEmail(input: VerifyEmailInput): Promise<void> {
  const tokenHash = hashOneTimeToken(input.token);

  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.expiresAt < new Date()) {
    throw new AppError(
      "Verification link is invalid or has expired.",
      400,
      "INVALID_VERIFICATION_TOKEN",
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { isEmailVerified: true },
    }),
    prisma.emailVerificationToken.delete({ where: { id: record.id } }),
  ]);
}

// ─── Resend Verification ──────────────────────────────────────────────────────

export async function resendVerification(
  input: ResendVerificationInput,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Always return success to prevent email enumeration
  if (!user || user.isEmailVerified) return;

  // Delete any existing token before issuing a new one
  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

  const plainToken = generateOneTimeToken();
  const tokenHash = hashOneTimeToken(plainToken);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFY_TTL_MS);

  await prisma.emailVerificationToken.create({
    data: { tokenHash, userId: user.id, expiresAt },
  });

  sendVerificationEmail(user.email, plainToken).catch((err) =>
    console.error("[auth] Failed to resend verification email.", err),
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}

export async function login(
  input: LoginInput,
  meta: TokenMeta = {},
): Promise<LoginResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Perform a dummy compare even if user is not found to prevent timing attacks
  const passwordMatch = user
    ? await bcrypt.compare(input.password, user.passwordHash)
    : await bcrypt.compare(input.password, "$2a$12$dummyhashtopreventtimingattacks");

  if (!user || !passwordMatch) {
    throw new AppError(GENERIC_AUTH_ERROR, 401, "INVALID_CREDENTIALS");
  }

  if (!user.isEmailVerified) {
    throw new AppError(
      "Please verify your email address before logging in.",
      403,
      "EMAIL_NOT_VERIFIED",
    );
  }

  if (!user.isActive) {
    throw new AppError(
      "This account has been suspended. Please contact support.",
      403,
      "ACCOUNT_SUSPENDED",
    );
  }

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = await issueRefreshToken(user.id, meta);

  return { accessToken, refreshToken, user: toSafeUser(user) };
}

// ─── Refresh ──────────────────────────────────────────────────────────────────

interface RefreshResult {
  accessToken: string;
  newRefreshToken: string;
}

export async function refresh(
  plainToken: string,
  meta: TokenMeta = {},
): Promise<RefreshResult> {
  const { newPlainToken, userId } = await rotateRefreshToken(plainToken, meta);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) {
    // Edge case: user was deactivated since token was issued
    await revokeAllUserTokens(userId);
    throw new AppError("Session invalid. Please log in again.", 401, "SESSION_INVALID");
  }

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return { accessToken, newRefreshToken: newPlainToken };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(plainToken: string): Promise<void> {
  await revokeRefreshToken(plainToken);
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Always return success — prevent email enumeration
  if (!user) return;

  // Invalidate any existing reset tokens before issuing a new one
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const plainToken = generateOneTimeToken();
  const tokenHash = hashOneTimeToken(plainToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  await prisma.passwordResetToken.create({
    data: { tokenHash, userId: user.id, expiresAt },
  });

  sendPasswordResetEmail(user.email, plainToken).catch((err) =>
    console.error("[auth] Failed to send password reset email.", err),
  );
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const tokenHash = hashOneTimeToken(input.token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.isUsed || record.expiresAt < new Date()) {
    throw new AppError(
      "Password reset link is invalid or has expired.",
      400,
      "INVALID_RESET_TOKEN",
    );
  }

  const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    // Mark token as used (keeps audit trail vs. deleting immediately)
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { isUsed: true },
    }),
  ]);

  // Revoke ALL sessions — force re-login on all devices after reset
  await revokeAllUserTokens(record.userId);
}

// ─── Get Me ───────────────────────────────────────────────────────────────────

export async function getMe(userId: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  return toSafeUser(user);
}

// ─── Update Profile ───────────────────────────────────────────────────────────

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<SafeUser> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
  });
  return toSafeUser(user);
}

// ─── Change Password ──────────────────────────────────────────────────────────

export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found.", 404, "USER_NOT_FOUND");

  const isMatch = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Current password is incorrect.", 400, "WRONG_PASSWORD");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  // Revoke all OTHER sessions (current session will refresh naturally)
  await revokeAllUserTokens(userId);
}

// ─── Delete Own Account ───────────────────────────────────────────────────────

export async function deleteOwnAccount(
  userId: string,
  plainRefreshToken: string,
): Promise<void> {
  // Soft-delete: deactivate and clear PII while preserving audit trail
  await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: false,
      email: `deleted_${userId}@deleted.invalid`,
      passwordHash: "",
      firstName: "Deleted",
      lastName: "User",
      avatarUrl: null,
    },
  });

  // Revoke all sessions
  await revokeAllUserTokens(userId);
  await revokeRefreshToken(plainRefreshToken).catch(() => undefined);
}
