import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/api/admin", adminRoutes);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/upload", uploadRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;