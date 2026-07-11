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
import contributionsRoutes from "./modules/contributions/contributions.routes";
import contributionsAdminRoutes from "./modules/contributions/contributions.admin.routes";
import contributionsDashboardRoutes from "./modules/contributions/contributions.dashboard.routes";
import adminCollectionsRoutes from "./modules/admin-collections/admin-collections.routes";
import weeklyRoutes from "./modules/weekly/weekly.routes";
import weeklyDashboardRoutes from "./modules/weekly/weekly.dashboard.routes";
import weeklyUploadRoutes from "./modules/weekly/weekly.upload.routes";
import engagementRoutes from "./modules/engagement/engagement.routes";
import magazineAdminRoutes from "./modules/magazine/magazine.admin.routes";
import magazineReaderRoutes from "./modules/magazine/magazine.reader.routes";
import newsletterRoutes from "./modules/newsletter/newsletter.routes";
import submissionsRoutes from "./modules/submissions/submissions.routes";
import { commentsPublicRouter, commentsAdminRouter } from "./modules/comments/comments.routes";
import { pageReactionsRouter } from "./modules/page-reactions/page-reactions.routes";
import adminUsersRoutes from "./modules/users/users.routes";
import meRoutes from "./modules/users/me.routes";
import adminDashboardRoutes from "./modules/admin-dashboard/admin-dashboard.routes";

// ─── App ──────────────────────────────────────────────────────────────────────

export const app = express();

// ─── Security middleware ──────────────────────────────────────────────────────

app.use(helmet());
app.use(
  cors({
    origin: env.ALLOWED_ORIGIN,           // parsed into string[] by env.ts
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
app.use("/api/contributions", contributionsRoutes);
app.use("/api/weekly", weeklyRoutes);
app.use("/api/engagement", engagementRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/submissions", submissionsRoutes);
app.use("/api/comments", commentsPublicRouter);
app.use("/api/page-reactions", pageReactionsRouter);
app.use("/api/magazine", magazineReaderRoutes);
app.use("/api/me", meRoutes);

// ─── Admin routes (ADMIN role required — enforced inside each router) ─────────

app.use("/api/admin/magazine", magazineAdminRoutes);
app.use("/api/admin/contributions", contributionsAdminRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/admin/comments", commentsAdminRouter);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/dashboard/contributions", contributionsDashboardRoutes);
app.use("/api/admin/dashboard/collections", adminCollectionsRoutes);
app.use("/api/admin/dashboard/weekly-upload", weeklyUploadRoutes);
app.use("/api/admin/dashboard/weekly", weeklyDashboardRoutes);

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
