import { PrismaClient } from "@prisma/client";

import { env } from "./env";

declare global {
  var __prismaClient__: PrismaClient | undefined;
}

const prismaClient =
  globalThis.__prismaClient__ ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (env.NODE_ENV !== "production") {
  globalThis.__prismaClient__ = prismaClient;
}

export const prisma = prismaClient;
