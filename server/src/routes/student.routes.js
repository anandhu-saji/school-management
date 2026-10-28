import express from "express";
import { getStudentDashboardData } from "../controllers/student.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireStudent } from "../middleware/role.middleware.js";

const router = express.Router();

// Apply auth + student role guard to all student routes
router.use(authenticate, requireStudent);

// GET /api/student/dashboard-data
router.get("/dashboard-data", getStudentDashboardData);

export default router;