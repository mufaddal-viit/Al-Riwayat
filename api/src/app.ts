import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";

import { env } from "./lib/env";
import contactRoutes from "./routes/contact";
import magazineRoutes from "./routes/magazine";
import newsletterRoutes from "./routes/newsletter";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
    optionsSuccessStatus: 204
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, status: "ok" });
});

app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/magazine", magazineRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found."
  });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error("Unhandled API error.", error);

  res.status(500).json({
    success: false,
    message: "An unexpected server error occurred."
  });
};

app.use(errorHandler);
