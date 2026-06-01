import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const ADMIN_SESSION_COOKIE = "al_riwayat_admin";

const SESSION_TTL_SECONDS = 60 * 60 * 8;

interface AdminSessionPayload {
  email: string;
  exp: number;
}

export interface AdminSession {
  email: string;
}

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function sign(value: string): string {
  return crypto
    .createHmac("sha256", getEnv("ADMIN_DASHBOARD_SESSION_SECRET"))
    .update(value)
    .digest("base64url");
}

function encodePayload(payload: AdminSessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(value: string): AdminSessionPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (
      typeof parsed.email !== "string" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function validateAdminCredentials(
  email: string,
  password: string,
): boolean {
  return (
    safeEqual(email.trim().toLowerCase(), getEnv("ADMIN_DASHBOARD_EMAIL").toLowerCase()) &&
    safeEqual(password, getEnv("ADMIN_DASHBOARD_PASSWORD"))
  );
}

export function createAdminSession(email: string): string {
  const payload = encodePayload({
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  });
  return `${payload}.${sign(payload)}`;
}

export function readAdminSession(): AdminSession | null {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) {
    return null;
  }

  const decoded = decodePayload(payload);
  if (!decoded || decoded.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return { email: decoded.email };
}

export function adminSessionCookieOptions(): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}
