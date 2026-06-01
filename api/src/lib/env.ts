import "dotenv/config";

import { z } from "zod";

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalString = (schema: z.ZodString = z.string()) =>
  z.preprocess(emptyStringToUndefined, schema.optional());

const optionalNumber = () =>
  z.preprocess(emptyStringToUndefined, z.coerce.number().int().optional());

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: optionalString(z.string().min(1)),
  ALLOWED_ORIGIN: z
    .string()
    .min(1, "ALLOWED_ORIGIN is required.")
    .transform((raw) =>
      raw
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    )
    .pipe(
      z
        .array(z.string().url("ALLOWED_ORIGIN entries must each be a valid URL."))
        .min(1, "ALLOWED_ORIGIN must contain at least one origin."),
    ),
  MOCK_DB: z.coerce.boolean().default(false),

  // ─── JWT ──────────────────────────────────────────────────────────────────
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters."),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters."),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().int().min(1).default(7),

  // ─── Cookie ───────────────────────────────────────────────────────────────
  COOKIE_DOMAIN: optionalString(),

  // ─── Email ────────────────────────────────────────────────────────────────
  EMAIL_FROM: z.string().default("noreply@alriwayat.com"),
  SMTP_HOST: optionalString(),
  SMTP_PORT: optionalNumber(),
  SMTP_USER: optionalString(),
  SMTP_PASS: optionalString(),

  // ─── App ──────────────────────────────────────────────────────────────────
  FRONTEND_URL: z.string().url().default("http://localhost:3001"),

  // ─── Data backend ─────────────────────────────────────────────────────────
  DATA_BACKEND: z.enum(["firestore", "prisma"]).default("firestore"),

  // ─── Firebase Admin ───────────────────────────────────────────────────────
  FIREBASE_PROJECT_ID: optionalString(z.string().min(1)),
  FIREBASE_CLIENT_EMAIL: optionalString(z.string().email()),
  FIREBASE_PRIVATE_KEY: optionalString(z.string().min(1)),
  ADMIN_DASHBOARD_SHARED_SECRET: optionalString(z.string().min(16)),

  // ─── Cloudinary ───────────────────────────────────────────────────────────
  CLOUDINARY_CLOUD_NAME: optionalString(z.string().min(1)),
  CLOUDINARY_API_KEY: optionalString(z.string().min(1)),
  CLOUDINARY_API_SECRET: optionalString(z.string().min(1)),
});

const refinedSchema = envSchema.superRefine((data, ctx) => {
  if (data.DATA_BACKEND === "prisma" && !data.DATABASE_URL) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["DATABASE_URL"],
      message: "DATABASE_URL is required when DATA_BACKEND=prisma.",
    });
  }

  if (data.DATA_BACKEND === "firestore") {
    if (!data.FIREBASE_PROJECT_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["FIREBASE_PROJECT_ID"],
        message: "FIREBASE_PROJECT_ID is required when DATA_BACKEND=firestore.",
      });
    }
    if (!data.FIREBASE_CLIENT_EMAIL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["FIREBASE_CLIENT_EMAIL"],
        message: "FIREBASE_CLIENT_EMAIL is required when DATA_BACKEND=firestore.",
      });
    }
    if (!data.FIREBASE_PRIVATE_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["FIREBASE_PRIVATE_KEY"],
        message: "FIREBASE_PRIVATE_KEY is required when DATA_BACKEND=firestore.",
      });
    }
  }
});

export const env = refinedSchema.parse(process.env);
