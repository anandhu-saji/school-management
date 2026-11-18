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
  updateTeacherAdmissionDelegation,
} from "../controllers/admin.controller.js";
import {
  getAdminProfileRequests,
  approveProfileRequest,
  rejectProfileRequest,
} from "../controllers/profile.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin, requireAdminOrAdmissionOfficer } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import { saveAttendanceSchema } from "../validators/attendance.validator.js";
import { createTeacherSchema, updateTeacherSchema } from "../validators/teacher.validator.js";
import { createStudentSchema, updateStudentSchema } from "../validators/student.validator.js";
import { createExamSchema, updateExamSchema } from "../validators/exam.validator.js";
import { createPaymentSchema, updatePaymentSchema } from "../validators/payment.validator.js";

const router = Router();

// Base Authentication for all admin routes
router.use(authenticate);

// Overview & Muster Endpoints (Chief Admin Only)
router.get("/overview-stats", requireAdmin, getAdminOverviewStats);
router.get("/division-muster", requireAdmin, getDivisionMuster);
router.get("/attendance/register", requireAdmin, getDivisionAttendanceRegister);
router.post("/attendance/register", requireAdmin, validate(saveAttendanceSchema), saveDivisionAttendanceRegister);

// Global User Search (Students, Teachers, Admins)
router.get("/users/search", requireAdmin, searchUsers);

// Teachers Endpoints (Chief Admin Only)
router.get("/teachers", requireAdmin, getTeachersRecords);
router.delete("/teachers/purge/all", requireAdmin, purgeAllTeachers);
router.post("/teachers", requireAdmin, validate(createTeacherSchema), createTeacher);
router.put("/teachers/:id", requireAdmin, validate(updateTeacherSchema), updateTeacher);
router.put("/teachers/:id/admission-admin", requireAdmin, updateTeacherAdmissionDelegation);
router.delete("/teachers/:id", requireAdmin, deleteTeacher);
router.post("/teachers/:id/restore", requireAdmin, restoreTeacher);
router.patch("/teachers/:id/restore", requireAdmin, restoreTeacher);
router.get("/teachers/:id/allotment", requireAdmin, getTeacherAllotment);

// Students Admission Endpoints (Chief Admin + Active Temporary Admission Officers)
router.get("/students", requireAdminOrAdmissionOfficer, getStudentsRecords);
router.delete("/students/purge/all", requireAdmin, purgeAllStudents); // Purge is Chief Admin ONLY
router.post("/students", requireAdminOrAdmissionOfficer, validate(createStudentSchema), createStudent);
router.put("/students/:id", requireAdminOrAdmissionOfficer, validate(updateStudentSchema), updateStudent);
router.delete("/students/:id", requireAdminOrAdmissionOfficer, deleteStudent);
router.post("/students/:id/restore", requireAdminOrAdmissionOfficer, restoreStudent);
router.patch("/students/:id/restore", requireAdminOrAdmissionOfficer, restoreStudent);

// Exam Timetables (Chief Admin Only)
router.get("/exams", requireAdmin, getExamTimetables);
router.delete("/exams/purge/all", requireAdmin, purgeAllExams);
router.post("/exams", requireAdmin, validate(createExamSchema), createExam);
router.put("/exams/:id", requireAdmin, validate(updateExamSchema), updateExam);
router.delete("/exams/:id", requireAdmin, deleteExam);
router.post("/exams/:id/restore", requireAdmin, restoreExam);
router.patch("/exams/:id/restore", requireAdmin, restoreExam);
router.get("/exams/:id/seating", requireAdmin, getExamSeatingPlan);

// Fee & Payment Endpoints (Chief Admin Only)
router.get("/payments", requireAdmin, getFeePayments);
router.get("/payments/summary", requireAdmin, getPaymentSummary);
router.post("/payments", requireAdmin, validate(createPaymentSchema), createFeePayment);
router.put("/payments/:id", requireAdmin, validate(updatePaymentSchema), updateFeePayment);
router.delete("/payments/:id", requireAdmin, deleteFeePayment);
router.post("/payments/:id/restore", requireAdmin, restoreFeePayment);
router.patch("/payments/:id/restore", requireAdmin, restoreFeePayment);

// Recycle Bin / Trash Endpoints (Chief Admin Only)
router.get("/trash", requireAdmin, getTrashRecords);
router.post("/trash/:type/:id/restore", requireAdmin, restoreTrashRecord);
router.delete("/trash/:type/:id", requireAdmin, permanentDeleteTrashRecord);
router.post("/trash/restore-all", requireAdmin, restoreAllTrash);
router.delete("/trash/empty", requireAdmin, emptyTrash);

// Academic Classes & Divisions (GET is accessible by Admission Officers to populate division lists)
router.get("/classes", requireAdminOrAdmissionOfficer, getClassesList);
router.post("/classes", requireAdmin, createClass);
router.put("/classes/:id", requireAdmin, updateClass);
router.delete("/classes/:id", requireAdmin, deleteClass);

// Profile Update Requests Management (Chief Admin Only)
router.get("/profile-requests", requireAdmin, getAdminProfileRequests);
router.post("/profile-requests/:id/approve", requireAdmin, approveProfileRequest);
router.post("/profile-requests/:id/reject", requireAdmin, rejectProfileRequest);

export default router;
