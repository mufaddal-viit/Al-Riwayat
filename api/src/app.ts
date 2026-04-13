import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";

import { env } from "./lib/env";
import {
  magazineSwaggerSpec,
  magazineSwaggerUi,
} from "./docs/magazine.swagger";
import contactRoutes from "./modules/contact/contact.routes";
import magazineAdminRoutes from "./modules/magazine/magazine.admin.routes";
import magazineReaderRoutes from "./modules/magazine/magazine.reader.routes";
import newsletterRoutes from "./modules/newsletter/newsletter.routes";
import commentsRoutes from "./modules/comments/comments.routes";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.ALLOWED_ORIGIN,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    optionsSuccessStatus: 204,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, status: "ok" });
});

app.get("/api/docs/magazine.json", (_req, res) => {
  res.status(200).json(magazineSwaggerSpec);
});
app.use("/api/docs/magazine", ...magazineSwaggerUi);

app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/magazine", magazineReaderRoutes);
app.use("/api/admin/magazine", magazineAdminRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error("Unhandled API error.", error);

  res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
};

app.use(errorHandler);
