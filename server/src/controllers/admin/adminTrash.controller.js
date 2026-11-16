import mongoose from "mongoose";
import Student from "../../models/Student.js";
import Teacher from "../../models/Teacher.js";
import Exam from "../../models/Exam.js";
import FeePayment from "../../models/FeePayment.js";
import User from "../../models/user.js";
import { StudentService } from "../../services/student.service.js";
import { TeacherService } from "../../services/teacher.service.js";
import { ExamService } from "../../services/exam.service.js";
import { PaymentService } from "../../services/payment.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Controller: Get all soft-deleted records across all modules
 * Route: GET /api/admin/trash
 */
export const getTrashRecords = asyncHandler(async (req, res) => {
  const [students, teachers, exams, payments] = await Promise.all([
    Student.find({ isDeleted: true }).sort({ deletedAt: -1 }).lean(),
    Teacher.find({ isDeleted: true }).sort({ deletedAt: -1 }).lean(),
    Exam.find({ isDeleted: true }).sort({ deletedAt: -1 }).lean(),
    FeePayment.find({ isDeleted: true }).sort({ deletedAt: -1 }).lean(),
  ]);

  const summary = {
    totalDeleted:
      (students?.length || 0) +
      (teachers?.length || 0) +
      (exams?.length || 0) +
      (payments?.length || 0),
    studentsCount: students?.length || 0,
    teachersCount: teachers?.length || 0,
    examsCount: exams?.length || 0,
    paymentsCount: payments?.length || 0,
  };

  return ApiResponse.ok(res, {
    summary,
    students: students || [],
    teachers: teachers || [],
    exams: exams || [],
    payments: payments || [],
  });
});

/**
 * Controller: Restore a specific soft-deleted item from trash
 * Route: POST /api/admin/trash/:type/:id/restore
 */
export const restoreTrashRecord = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const cleanType = String(type).toLowerCase().replace(/s$/, "");

  let restoredItem = null;
  let typeLabel = "Item";

  switch (cleanType) {
    case "student":
      restoredItem = await StudentService.restoreStudent(id);
      typeLabel = `Student ${restoredItem.name}`;
      break;
    case "teacher":
      restoredItem = await TeacherService.restoreTeacher(id);
      typeLabel = `Teacher ${restoredItem.name}`;
      break;
    case "exam":
      restoredItem = await ExamService.restoreExam(id);
      typeLabel = `Exam paper ${restoredItem.subject}`;
      break;
    case "payment":
      restoredItem = await PaymentService.restoreFeePayment(id);
      typeLabel = `Payment receipt ${restoredItem.receiptNumber}`;
      break;
    default:
      throw ApiError.badRequest(
        `Invalid entity type '${type}'. Expected: student, teacher, exam, or payment.`
      );
  }

  return ApiResponse.ok(res, {
    message: `${typeLabel} restored successfully from trash!`,
    item: restoredItem,
  });
});

/**
 * Controller: Permanently hard-delete a specific record from trash
 * Route: DELETE /api/admin/trash/:type/:id
 */
export const permanentDeleteTrashRecord = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const cleanType = String(type).toLowerCase().replace(/s$/, "");

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest("Invalid ID format.");
  }

  let deletedCount = 0;
  let typeLabel = "Item";

  switch (cleanType) {
    case "student": {
      const student = await Student.findOne({ _id: id, isDeleted: true });
      if (!student) {
        throw ApiError.notFound("Student record not found in trash.");
      }
      typeLabel = `Student ${student.name}`;
      if (student.userId) {
        await User.findByIdAndDelete(student.userId);
      } else if (student.email) {
        await User.findOneAndDelete({ email: student.email.toLowerCase() });
      }
      await Student.findByIdAndDelete(id);
      deletedCount = 1;
      break;
    }
    case "teacher": {
      const teacher = await Teacher.findOne({ _id: id, isDeleted: true });
      if (!teacher) {
        throw ApiError.notFound("Teacher record not found in trash.");
      }
      typeLabel = `Teacher ${teacher.name}`;
      if (teacher.userId) {
        await User.findByIdAndDelete(teacher.userId);
      } else if (teacher.email) {
        await User.findOneAndDelete({ email: teacher.email.toLowerCase() });
      }
      await Teacher.findByIdAndDelete(id);
      deletedCount = 1;
      break;
    }
    case "exam": {
      const exam = await Exam.findOne({ _id: id, isDeleted: true });
      if (!exam) {
        throw ApiError.notFound("Exam record not found in trash.");
      }
      typeLabel = `Exam paper ${exam.subject}`;
      await Exam.findByIdAndDelete(id);
      deletedCount = 1;
      break;
    }
    case "payment": {
      const payment = await FeePayment.findOne({ _id: id, isDeleted: true });
      if (!payment) {
        throw ApiError.notFound("Payment record not found in trash.");
      }
      typeLabel = `Payment receipt ${payment.receiptNumber}`;
      await FeePayment.findByIdAndDelete(id);
      deletedCount = 1;
      break;
    }
    default:
      throw ApiError.badRequest(
        `Invalid entity type '${type}'. Expected: student, teacher, exam, or payment.`
      );
  }

  return ApiResponse.ok(res, {
    message: `${typeLabel} permanently removed from database.`,
    deletedCount,
  });
});

/**
 * Controller: Restore all soft-deleted records across all collections
 * Route: POST /api/admin/trash/restore-all
 */
export const restoreAllTrash = asyncHandler(async (req, res) => {
  const [sRes, tRes, eRes, pRes] = await Promise.all([
    Student.restore({}),
    Teacher.restore({}),
    Exam.restore({}),
    FeePayment.restore({}),
  ]);

  // Also reactivate all restored user accounts
  await User.updateMany(
    { isDeleted: true },
    { $set: { isDeleted: false, deletedAt: null, deletedBy: null, isActive: true } }
  );

  const restoredCount =
    (sRes?.modifiedCount || 0) +
    (tRes?.modifiedCount || 0) +
    (eRes?.modifiedCount || 0) +
    (pRes?.modifiedCount || 0);

  return ApiResponse.ok(res, {
    message: `All records restored from trash (${restoredCount} total items).`,
    details: {
      studentsRestored: sRes?.modifiedCount || 0,
      teachersRestored: tRes?.modifiedCount || 0,
      examsRestored: eRes?.modifiedCount || 0,
      paymentsRestored: pRes?.modifiedCount || 0,
    },
  });
});

/**
 * Controller: Permanently empty all items in trash
 * Route: DELETE /api/admin/trash/empty
 */
export const emptyTrash = asyncHandler(async (req, res) => {
  const [sRes, tRes, eRes, pRes, uRes] = await Promise.all([
    Student.deleteMany({ isDeleted: true }),
    Teacher.deleteMany({ isDeleted: true }),
    Exam.deleteMany({ isDeleted: true }),
    FeePayment.deleteMany({ isDeleted: true }),
    User.deleteMany({ isDeleted: true, role: { $ne: "admin" } }),
  ]);

  const purgedCount =
    (sRes?.deletedCount || 0) +
    (tRes?.deletedCount || 0) +
    (eRes?.deletedCount || 0) +
    (pRes?.deletedCount || 0) +
    (uRes?.deletedCount || 0);

  return ApiResponse.ok(res, {
    message: `Trash emptied permanently (${purgedCount} total documents removed).`,
    details: {
      studentsPurged: sRes?.deletedCount || 0,
      teachersPurged: tRes?.deletedCount || 0,
      examsPurged: eRes?.deletedCount || 0,
      paymentsPurged: pRes?.deletedCount || 0,
      accountsPurged: uRes?.deletedCount || 0,
    },
  });
});
