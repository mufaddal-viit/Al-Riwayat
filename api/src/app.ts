import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";

import { AppError } from "./lib/AppError";
import { env } from "./lib/env";
import {
  magazineSwaggerSpec,
  magazineSwaggerUi,
} from "./docs/magazine.swagger";

// ─── Route imports ────────────────────────────────────────────────────────────
import authRoutes from "./modules/auth/auth.routes";
import contactRoutes from "./modules/contact/contact.routes";
import magazineAdminRoutes from "./modules/magazine/magazine.admin.routes";
import magazineReaderRoutes from "./modules/magazine/magazine.reader.routes";
import newsletterRoutes from "./modules/newsletter/newsletter.routes";
import { commentsPublicRouter, commentsAdminRouter } from "./modules/comments/comments.routes";
import adminUsersRoutes from "./modules/users/users.routes";

// ─── App ──────────────────────────────────────────────────────────────────────

export const app = express();

// ─── Security middleware ──────────────────────────────────────────────────────

app.use(helmet());
app.use(
  cors({
    origin: env.ALLOWED_ORIGIN,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,          // Required for httpOnly cookie exchange
    optionsSuccessStatus: 204,
  }),
);

// ─── Parsing middleware ───────────────────────────────────────────────────────

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());        // Must come before auth routes

// ─── Health ───────────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, status: "ok" });
});

// ─── API Docs ─────────────────────────────────────────────────────────────────

app.get("/api/docs/magazine.json", (_req, res) => {
  res.status(200).json(magazineSwaggerSpec);
});
app.use("/api/docs/magazine", ...magazineSwaggerUi);

// ─── Auth routes (public + authenticated self-service) ────────────────────────

app.use("/api/auth", authRoutes);

// ─── Feature routes ───────────────────────────────────────────────────────────

app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/comments", commentsPublicRouter);
app.use("/api/magazine", magazineReaderRoutes);

// ─── Admin routes (ADMIN role required — enforced inside each router) ─────────

app.use("/api/admin/magazine", magazineAdminRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/admin/comments", commentsAdminRouter);

// ─── 404 ──────────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ─── Global error handler ─────────────────────────────────────────────────────

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  // Operational errors (AppError) are forwarded with their status + code
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.code && { code: error.code }),
    });
    return;
  }

  // Unexpected errors — log in full, return a generic message
  console.error("[app] Unhandled error:", error);
  res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
};

app.use(errorHandler);
