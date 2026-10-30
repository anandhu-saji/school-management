import { Router } from "express";
import {
  getAdminOverviewStats,
  getDivisionMuster,
  getTeachersRecords,
  getStudentsRecords,
  getExamTimetables,
} from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/role.middleware.js";

const router = Router();

// Secure all admin routes: Requires valid JWT + Admin role
router.use(authenticate, requireAdmin);

router.get("/overview-stats", getAdminOverviewStats);
router.get("/division-muster", getDivisionMuster);
router.get("/teachers", getTeachersRecords);
router.get("/students", getStudentsRecords);
router.get("/exams", getExamTimetables);

export default router;