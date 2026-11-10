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
  purgeAllTeachers,
  getTeacherAllotment,
  getStudentsRecords,
  createStudent,
  updateStudent,
  deleteStudent,
  purgeAllStudents,
  getExamTimetables,
  createExam,
  updateExam,
  deleteExam,
  purgeAllExams,
  getExamSeatingPlan,
  getFeePayments,
  getPaymentSummary,
  createFeePayment,
  updateFeePayment,
  deleteFeePayment,
} from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import { saveAttendanceSchema } from "../validators/attendance.validator.js";
import { createTeacherSchema, updateTeacherSchema } from "../validators/teacher.validator.js";
import { createStudentSchema, updateStudentSchema } from "../validators/student.validator.js";
import { createExamSchema, updateExamSchema } from "../validators/exam.validator.js";
import { createPaymentSchema, updatePaymentSchema } from "../validators/payment.validator.js";

const router = Router();

// Secure all admin routes: Requires valid JWT + Admin role
router.use(authenticate, requireAdmin);

// Overview & Muster Endpoints
router.get("/overview-stats", getAdminOverviewStats);
router.get("/division-muster", getDivisionMuster);
router.get("/attendance/register", getDivisionAttendanceRegister);
router.post("/attendance/register", validate(saveAttendanceSchema), saveDivisionAttendanceRegister);

// Teachers Endpoints
router.get("/teachers", getTeachersRecords);
router.delete("/teachers/purge/all", purgeAllTeachers);
router.post("/teachers", validate(createTeacherSchema), createTeacher);
router.put("/teachers/:id", validate(updateTeacherSchema), updateTeacher);
router.delete("/teachers/:id", deleteTeacher);
router.get("/teachers/:id/allotment", getTeacherAllotment);

// Students Endpoints
router.get("/students", getStudentsRecords);
router.delete("/students/purge/all", purgeAllStudents);
router.post("/students", validate(createStudentSchema), createStudent);
router.put("/students/:id", validate(updateStudentSchema), updateStudent);
router.delete("/students/:id", deleteStudent);

// Exam Timetables
router.get("/exams", getExamTimetables);
router.delete("/exams/purge/all", purgeAllExams);
router.post("/exams", validate(createExamSchema), createExam);
router.put("/exams/:id", validate(updateExamSchema), updateExam);
router.delete("/exams/:id", deleteExam);
router.get("/exams/:id/seating", getExamSeatingPlan);

// Fee & Payment Endpoints
router.get("/payments", getFeePayments);
router.get("/payments/summary", getPaymentSummary);
router.post("/payments", validate(createPaymentSchema), createFeePayment);
router.put("/payments/:id", validate(updatePaymentSchema), updateFeePayment);
router.delete("/payments/:id", deleteFeePayment);

export default router;
