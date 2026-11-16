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
  restoreTeacher,
  restoreStudent,
  restoreExam,
  restoreFeePayment,
  getTrashRecords,
  restoreTrashRecord,
  permanentDeleteTrashRecord,
  restoreAllTrash,
  emptyTrash,
  getClassesList,
  createClass,
  updateClass,
  deleteClass,
  searchUsers,
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

// Global User Search (Students, Teachers, Admins)
router.get("/users/search", searchUsers);

// Teachers Endpoints
router.get("/teachers", getTeachersRecords);
router.delete("/teachers/purge/all", purgeAllTeachers);
router.post("/teachers", validate(createTeacherSchema), createTeacher);
router.put("/teachers/:id", validate(updateTeacherSchema), updateTeacher);
router.delete("/teachers/:id", deleteTeacher);
router.post("/teachers/:id/restore", restoreTeacher);
router.patch("/teachers/:id/restore", restoreTeacher);
router.get("/teachers/:id/allotment", getTeacherAllotment);

// Students Endpoints
router.get("/students", getStudentsRecords);
router.delete("/students/purge/all", purgeAllStudents);
router.post("/students", validate(createStudentSchema), createStudent);
router.put("/students/:id", validate(updateStudentSchema), updateStudent);
router.delete("/students/:id", deleteStudent);
router.post("/students/:id/restore", restoreStudent);
router.patch("/students/:id/restore", restoreStudent);

// Exam Timetables
router.get("/exams", getExamTimetables);
router.delete("/exams/purge/all", purgeAllExams);
router.post("/exams", validate(createExamSchema), createExam);
router.put("/exams/:id", validate(updateExamSchema), updateExam);
router.delete("/exams/:id", deleteExam);
router.post("/exams/:id/restore", restoreExam);
router.patch("/exams/:id/restore", restoreExam);
router.get("/exams/:id/seating", getExamSeatingPlan);

// Fee & Payment Endpoints
router.get("/payments", getFeePayments);
router.get("/payments/summary", getPaymentSummary);
router.post("/payments", validate(createPaymentSchema), createFeePayment);
router.put("/payments/:id", validate(updatePaymentSchema), updateFeePayment);
router.delete("/payments/:id", deleteFeePayment);
router.post("/payments/:id/restore", restoreFeePayment);
router.patch("/payments/:id/restore", restoreFeePayment);

// Recycle Bin / Trash Endpoints
router.get("/trash", getTrashRecords);
router.post("/trash/:type/:id/restore", restoreTrashRecord);
router.delete("/trash/:type/:id", permanentDeleteTrashRecord);
router.post("/trash/restore-all", restoreAllTrash);
router.delete("/trash/empty", emptyTrash);

// Academic Classes & Divisions Management
router.get("/classes", getClassesList);
router.post("/classes", createClass);
router.put("/classes/:id", updateClass);
router.delete("/classes/:id", deleteClass);

export default router;
