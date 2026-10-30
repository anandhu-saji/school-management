import { Router } from "express";
import {
  getAdminOverviewStats,
  getDivisionMuster,
  getTeachersRecords,
  getStudentsRecords,
  createStudent,
  updateStudent,
  deleteStudent,
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

// Students Endpoints
router.get("/students", getStudentsRecords);
router.post("/students", createStudent);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);

router.get("/exams", getExamTimetables);

export default router;
