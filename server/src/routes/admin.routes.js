import { Router } from "express";
import {
  getAdminOverviewStats,
  getDivisionMuster,
  getDivisionAttendanceRegister,
  saveDivisionAttendanceRegister,
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
  createExam,
  updateExam,
  deleteExam,
  getExamSeatingPlan,
} from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/role.middleware.js";

const router = Router();

// Secure all admin routes: Requires valid JWT + Admin role
router.use(authenticate, requireAdmin);

router.get("/overview-stats", getAdminOverviewStats);
router.get("/division-muster", getDivisionMuster);
router.get("/attendance/register", getDivisionAttendanceRegister);
router.post("/attendance/register", saveDivisionAttendanceRegister);

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
router.post("/exams", createExam);
router.put("/exams/:id", updateExam);
router.delete("/exams/:id", deleteExam);
router.get("/exams/:id/seating", getExamSeatingPlan);

export default router;
