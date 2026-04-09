import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  ALLOWED_ORIGIN: z.string().url("ALLOWED_ORIGIN must be a valid URL."),
  MOCK_DB: z.coerce.boolean().default(false),
});

export const env = envSchema.parse(process.env);
