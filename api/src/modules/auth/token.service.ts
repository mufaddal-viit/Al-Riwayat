import crypto from "crypto";

import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import type { Role } from "@prisma/client";

import { AppError } from "../../lib/AppError";
import { env } from "../../lib/env";
import { prisma } from "../../lib/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AccessTokenPayload {
  sub: string;    // User.id
  email: string;
  role: Role;
}

interface RefreshTokenMeta {
  userAgent?: string;
  ipAddress?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** SHA-256 hash a plain token before storing in the database. */
function hashToken(plainToken: string): string {
  return crypto.createHash("sha256").update(plainToken).digest("hex");
}

/** Generate a cryptographically secure random hex string. */
function generateSecureToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

// ─── Access Token ─────────────────────────────────────────────────────────────

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    algorithm: "HS256",
  });
}

/**
 * Verify and decode an access token.
 * Throws AppError(401) with a machine-readable code so the frontend
 * can distinguish expired tokens from completely invalid ones.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new AppError("Access token expired.", 401, "TOKEN_EXPIRED");
    }
    if (err instanceof JsonWebTokenError) {
      throw new AppError("Invalid access token.", 401, "INVALID_TOKEN");
    }
    throw new AppError("Token verification failed.", 401, "INVALID_TOKEN");
  }
}

// ─── Refresh Token ────────────────────────────────────────────────────────────

/**
 * Generate a secure random refresh token, hash it, persist the hash,
 * and return the plain token (sent to the client once via httpOnly cookie).
 */
export async function issueRefreshToken(
  userId: string,
  meta: RefreshTokenMeta = {},
): Promise<string> {
  const plainToken = generateSecureToken();
  const tokenHash = hashToken(plainToken);
  const expiresAt = new Date(
    Date.now() + env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  );

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    },
  });

  return plainToken;
}

/**
 * Rotate a refresh token:
 *  1. Hash the incoming plain token and look it up.
 *  2. If revoked or expired → possible reuse attack → revoke the entire
 *     user's token family and throw.
 *  3. Delete the used token and issue a fresh one.
 *
 * Returns { newPlainToken, userId }.
 */
export async function rotateRefreshToken(
  plainToken: string,
  meta: RefreshTokenMeta = {},
): Promise<{ newPlainToken: string; userId: string }> {
  const tokenHash = hashToken(plainToken);

  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (!existing) {
    throw new AppError(
      "Refresh token not found.",
      401,
      "INVALID_REFRESH_TOKEN",
    );
  }

  // Reuse or tampering detected — revoke ALL tokens for this user
  if (existing.isRevoked || existing.expiresAt < new Date()) {
    await revokeAllUserTokens(existing.userId);
    throw new AppError(
      "Refresh token is invalid or expired. Please log in again.",
      401,
      "REFRESH_TOKEN_REUSE",
    );
  }

  // Atomically delete the old token and issue a new one
  await prisma.refreshToken.delete({ where: { id: existing.id } });
  const newPlainToken = await issueRefreshToken(existing.userId, meta);

  return { newPlainToken, userId: existing.userId };
}

/**
 * Revoke a single refresh token on explicit logout.
 * Silently succeeds if the token is not found (already revoked / expired).
 */
export async function revokeRefreshToken(plainToken: string): Promise<void> {
  const tokenHash = hashToken(plainToken);
  await prisma.refreshToken
    .delete({ where: { tokenHash } })
    .catch(() => undefined); // ignore not-found
}

/**
 * Revoke ALL refresh tokens for a user.
 * Called on password change, password reset, and account deactivation.
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}
