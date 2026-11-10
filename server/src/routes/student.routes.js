import { Router } from "express";
import {
  getStudentDashboardData,
  getStudentExamsData,
  getStudentFeesData,
  createRazorpayOrder,
  verifyRazorpayPayment,
  changeStudentPassword,
} from "../controllers/student.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireStudent } from "../middleware/role.middleware.js";

const router = Router();

// Apply auth + student role guard to all student routes
router.use(authenticate, requireStudent);

// GET /api/student/dashboard-data
router.get("/dashboard-data", getStudentDashboardData);

// GET /api/student/exams
router.get("/exams", getStudentExamsData);

// GET /api/student/fees
router.get("/fees", getStudentFeesData);

// Razorpay Online Payment Endpoints
router.post("/create-razorpay-order", createRazorpayOrder);
router.post("/verify-razorpay-payment", verifyRazorpayPayment);

// PUT /api/student/change-password
router.put("/change-password", changeStudentPassword);

export default router;
