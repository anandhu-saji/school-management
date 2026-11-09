import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

// Route imports
import authRoutes from "./routes/auth.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import studentRoutes from "./routes/student.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// Middleware imports
import { errorHandler } from "./middleware/error.middleware.js";
import { authenticate } from "./middleware/auth.middleware.js";
import { ApiError } from "./utils/ApiError.js";

const app = express();

// Allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
].filter(Boolean);

// Global Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);

      // Check configured or localhost/127.0.0.1 dev ports
      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new ApiError(403, `CORS blocked: Origin ${origin} is not allowed.`));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static uploaded avatars are public
app.use("/uploads/avatars", express.static(path.resolve("uploads/avatars")));

// Protected statutory student KYC documents require authentication
app.use("/uploads/documents", authenticate, express.static(path.resolve("uploads/documents")));

// General uploads fallback (if any other files exist)
app.use("/uploads", express.static(path.resolve("uploads")));

// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/upload", uploadRoutes);

// Health Check & Monitoring Probe
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    service: "GHSS School Portal API",
    version: "1.0.0",
  });
});

// Production Client Static Serving (Single-Port Production Deployment)
const clientDistPath = path.resolve("../client/dist");
if (fs.existsSync(clientDistPath) && (process.env.NODE_ENV === "production" || process.env.SERVE_CLIENT === "true")) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"), (err) => {
      if (err) next();
    });
  });
}

// 404 Not Found Handler
app.use((req, res, next) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
});

// Global Centralized Error Handler
app.use(errorHandler);

export default app;
