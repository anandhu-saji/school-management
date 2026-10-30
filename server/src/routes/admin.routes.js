import { Router } from "express";
import {
  getAdminOverviewStats,
  getDivisionMuster,
  getTeachersRecords,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherAllotment,
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

// Teachers Endpoints
router.get("/teachers", getTeachersRecords);
router.post("/teachers", createTeacher);
router.put("/teachers/:id", updateTeacher);
router.delete("/teachers/:id", deleteTeacher);
router.get("/teachers/:id/allotment", getTeacherAllotment);

// Students Endpoints
router.get("/students", getStudentsRecords);
router.post("/students", createStudent);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);

// Exam Timetables
router.get("/exams", getExamTimetables);

export default router;
