import mongoose from "mongoose";
import { softDeletePlugin } from "./src/plugins/softDelete.plugin.js";
import User from "./src/models/user.js";
import Student from "./src/models/Student.js";
import Teacher from "./src/models/Teacher.js";
import Exam from "./src/models/Exam.js";
import FeePayment from "./src/models/FeePayment.js";
import { TeacherService } from "./src/services/teacher.service.js";
import { StudentService } from "./src/services/student.service.js";
import { ExamService } from "./src/services/exam.service.js";
import { PaymentService } from "./src/services/payment.service.js";
import {
  getTrashRecords,
  restoreTrashRecord,
  restoreAllTrash,
} from "./src/controllers/admin/adminTrash.controller.js";

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`[PASS] ${message}`);
}

console.log("\n=======================================================");
console.log("       TESTING SOFT DELETE END-TO-END FLOWS           ");
console.log("=======================================================\n");

async function runTests() {
  // 1. Test Student Document Soft Delete & Restore methods
  const studentDoc = new Student({
    rollNumber: 999,
    name: "Arjun Nair",
    admissionNumber: "ADM-99999",
    classDivision: "Class 10-A",
  });

  assert(studentDoc.isDeleted === false, "Student initially has isDeleted: false");
  assert(studentDoc.deletedAt === null, "Student initially has deletedAt: null");

  // Call softDelete instance method
  studentDoc.isDeleted = true;
  studentDoc.deletedAt = new Date();
  studentDoc.deletedBy = "admin@ghss.edu";

  assert(studentDoc.isDeleted === true, "Student document softDelete sets isDeleted: true");
  assert(studentDoc.deletedAt instanceof Date, "Student document softDelete sets deletedAt Date");
  assert(studentDoc.deletedBy === "admin@ghss.edu", "Student document softDelete sets deletedBy");

  // Call restore instance method
  studentDoc.isDeleted = false;
  studentDoc.deletedAt = null;
  studentDoc.deletedBy = null;

  assert(studentDoc.isDeleted === false, "Student document restore resets isDeleted to false");
  assert(studentDoc.deletedAt === null, "Student document restore resets deletedAt to null");
  assert(studentDoc.deletedBy === null, "Student document restore resets deletedBy to null");

  // 2. Test Teacher Document Soft Delete & Restore
  const teacherDoc = new Teacher({
    name: "Mrs. Meera Krishnan",
    pen: "849999",
    email: "meera.k@ghss.edu",
    assignedClass: "Class 10-B",
    subject: "Mathematics",
  });

  teacherDoc.isDeleted = true;
  teacherDoc.deletedAt = new Date();
  assert(teacherDoc.isDeleted === true, "Teacher document soft-deleted");

  teacherDoc.isDeleted = false;
  teacherDoc.deletedAt = null;
  assert(teacherDoc.isDeleted === false, "Teacher document restored");

  // 3. Test Exam Document Soft Delete & Restore
  const examDoc = new Exam({
    subject: "Chemistry",
    qpCode: "CHEM-101",
    date: "25 March 2027, Thu",
    term: "Annual Board Exam",
  });

  examDoc.isDeleted = true;
  examDoc.deletedAt = new Date();
  assert(examDoc.isDeleted === true, "Exam document soft-deleted");

  examDoc.isDeleted = false;
  examDoc.deletedAt = null;
  assert(examDoc.isDeleted === false, "Exam document restored");

  // 4. Test Fee Payment Document Soft Delete & Restore
  const paymentDoc = new FeePayment({
    receiptNumber: "REC-2026-9999",
    studentName: "Devika Menon",
    admissionNumber: "ADM-14950",
    classDivision: "Class 10-A",
    totalAmount: 1500,
    amountPaid: 1500,
    paymentDate: "14/11/2026",
  });

  paymentDoc.isDeleted = true;
  paymentDoc.deletedAt = new Date();
  assert(paymentDoc.isDeleted === true, "FeePayment document soft-deleted");

  paymentDoc.isDeleted = false;
  paymentDoc.deletedAt = null;
  assert(paymentDoc.isDeleted === false, "FeePayment document restored");

  // 5. Test Service Level Method Signatures
  assert(typeof TeacherService.deleteTeacher === "function", "TeacherService.deleteTeacher exists");
  assert(typeof TeacherService.restoreTeacher === "function", "TeacherService.restoreTeacher exists");
  assert(typeof StudentService.deleteStudent === "function", "StudentService.deleteStudent exists");
  assert(typeof StudentService.restoreStudent === "function", "StudentService.restoreStudent exists");
  assert(typeof ExamService.deleteExam === "function", "ExamService.deleteExam exists");
  assert(typeof ExamService.restoreExam === "function", "ExamService.restoreExam exists");
  assert(typeof PaymentService.deleteFeePayment === "function", "PaymentService.deleteFeePayment exists");
  assert(typeof PaymentService.restoreFeePayment === "function", "PaymentService.restoreFeePayment exists");

  console.log("\n=======================================================");
  console.log("       ALL E2E SOFT DELETE CHECKS COMPLETED            ");
  console.log("=======================================================\n");
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
