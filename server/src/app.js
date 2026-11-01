import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

// Route imports
import authRoutes from "./routes/auth.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import studentRoutes from "./routes/student.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// Error Middleware
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Global Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      // Allow localhost and 127.0.0.1 on any dev port (5173, 5174, 5175, 3000, etc.)
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static uploaded documents and assets
app.use("/uploads", express.static(path.resolve("uploads")));

// Admin Routes
app.use("/api/admin", adminRoutes);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/upload", uploadRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
