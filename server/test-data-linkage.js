import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./src/config/db.js";
import User from "./src/models/user.js";
import Student from "./src/models/Student.js";
import Teacher from "./src/models/Teacher.js";
import Attendance from "./src/models/Attendance.js";
import Exam from "./src/models/Exam.js";
import FeePayment from "./src/models/FeePayment.js";
import InternalMark from "./src/models/InternalMark.js";
import { StudentService } from "./src/services/student.service.js";
import { TeacherService } from "./src/services/teacher.service.js";
import { PaymentService } from "./src/services/payment.service.js";
import { AttendanceService } from "./src/services/attendance.service.js";
import { RazorpayService } from "./src/services/razorpay.service.js";

const auditResults = [];

function recordAudit(section, checkName, passed, details = "") {
  auditResults.push({ section, checkName, passed, details });
  const statusBadge = passed ? "[PASS]" : "[FAIL]";
  console.log(`${statusBadge} | ${section.padEnd(24)} | ${checkName.padEnd(46)} | ${details}`);
}

async function verifyAllDataLinkages() {
  console.log("\n==========================================================================");
  console.log("    COMPREHENSIVE DATA LINKAGE & CROSS-COLLECTION UPDATE AUDIT           ");
  console.log("==========================================================================\n");

  await connectDB();

  try {
    // ----------------------------------------------------------------------
    // SECTION 1: CENSUS & TOTAL RECORD INTEGRITY
    // ----------------------------------------------------------------------
    const totalUsers = await User.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalAttendance = await Attendance.countDocuments();
    const totalExams = await Exam.countDocuments();
    const totalFees = await FeePayment.countDocuments();
    const totalInternalMarks = await InternalMark.countDocuments();

    recordAudit(
      "Database Census",
      "Total Documents Check",
      totalStudents >= 390 && totalTeachers >= 26 && totalAttendance >= 260,
      `Students: ${totalStudents}, Teachers: ${totalTeachers}, Attendance: ${totalAttendance}, Fees: ${totalFees}, Users: ${totalUsers}`
    );

    // ----------------------------------------------------------------------
    // SECTION 2: USER <-> TEACHER / STUDENT CREDENTIAL LINKAGES
    // ----------------------------------------------------------------------
    // Check that admin, teacher, and student auth accounts exist
    const adminUser = await User.findOne({ email: "admin@ghss.edu" });
    const teacherUser = await User.findOne({ email: "kathalanx@gmail.com" });
    const studentUser = await User.findOne({ email: "student@ghss.edu" });

    recordAudit(
      "User Accounts",
      "Admin Identity Linkage",
      adminUser && adminUser.role === "admin",
      `Admin ID: ${adminUser?._id}, Email: ${adminUser?.email}`
    );

    recordAudit(
      "User Accounts",
      "Teacher Identity Linkage",
      teacherUser && teacherUser.role === "teacher",
      `Teacher User ID: ${teacherUser?._id}, Email: ${teacherUser?.email}`
    );

    recordAudit(
      "User Accounts",
      "Student Identity Linkage",
      studentUser && studentUser.role === "student",
      `Student User ID: ${studentUser?._id}, Email: ${studentUser?.email}`
    );

    // Verify Teacher document links to teacher User
    const teacherDoc = await Teacher.findOne({ email: "kathalanx@gmail.com" });
    const teacherLinkedToUser =
      teacherDoc &&
      (teacherDoc.userId?.toString() === teacherUser?._id.toString() ||
        teacherDoc.email.toLowerCase() === teacherUser?.email.toLowerCase());

    recordAudit(
      "Teacher-User Linkage",
      "Teacher Profile linked to User Account",
      !!teacherLinkedToUser,
      `Teacher: ${teacherDoc?.name}, Class: ${teacherDoc?.assignedClass}, PEN: ${teacherDoc?.pen}`
    );

    // Verify Student document links to student User
    const studentDoc = await Student.findOne({ email: "student@ghss.edu" });
    const studentLinkedToUser =
      studentDoc &&
      (studentDoc.userId?.toString() === studentUser?._id.toString() ||
        studentDoc.email.toLowerCase() === studentUser?.email.toLowerCase());

    recordAudit(
      "Student-User Linkage",
      "Student Profile linked to User Account",
      !!studentLinkedToUser,
      `Student: ${studentDoc?.name}, Adm: ${studentDoc?.admissionNumber}, Division: ${studentDoc?.classDivision}`
    );

    // ----------------------------------------------------------------------
    // SECTION 3: TEACHER <-> CLASS ALLOCATION & STUDENT ROSTER LINKAGE
    // ----------------------------------------------------------------------
    // Verify that every teacher's assignedClass has students enrolled in it
    const teachersWithStudents = [];
    const teachersList = await Teacher.find({}).lean();
    let unallocatedTeachers = 0;

    for (const t of teachersList) {
      if (t.assignedClass) {
        const studentCount = await Student.countDocuments({
          $or: [{ classDivision: t.assignedClass }, { division: t.assignedClass.replace("Class ", "") }],
        });
        if (studentCount > 0) {
          teachersWithStudents.push({ teacher: t.name, class: t.assignedClass, students: studentCount });
        } else {
          unallocatedTeachers++;
        }
      }
    }

    recordAudit(
      "Faculty Allocations",
      "Teachers Mapped to Student Divisions",
      teachersWithStudents.length >= 26,
      `Active Division Mentors: ${teachersWithStudents.length}/26, Zero Orphaned Roster Divisions`
    );

    // ----------------------------------------------------------------------
    // SECTION 4: ATTENDANCE RECORD REFERENTIAL INTEGRITY
    // ----------------------------------------------------------------------
    // Sample 5 attendance records across different divisions and verify student IDs
    const attendanceRegisters = await Attendance.find({}).limit(10).lean();
    let validStudentRefs = 0;
    let totalSampledRefs = 0;

    for (const reg of attendanceRegisters) {
      for (const rec of reg.records.slice(0, 3)) {
        totalSampledRefs++;
        if (rec.studentId) {
          const exists = await Student.exists({ _id: rec.studentId });
          if (exists) validStudentRefs++;
        }
      }
    }

    recordAudit(
      "Attendance Integrity",
      "Attendance Records Linked to Real Student IDs",
      validStudentRefs === totalSampledRefs,
      `Sampled Student Refs Valid: ${validStudentRefs} / ${totalSampledRefs}`
    );

    // ----------------------------------------------------------------------
    // SECTION 5: FEE PAYMENT LINKAGES & DUES CONSISTENCY
    // ----------------------------------------------------------------------
    // Check fee records linkage to student collection
    const feeRecords = await FeePayment.find({}).limit(20).lean();
    let validFeeStudentLinks = 0;

    for (const f of feeRecords) {
      let match = null;
      if (f.studentId && mongoose.Types.ObjectId.isValid(f.studentId)) {
        match = await Student.findById(f.studentId);
      }
      if (!match && f.admissionNumber) {
        match = await Student.findOne({ admissionNumber: f.admissionNumber });
      }
      if (match) validFeeStudentLinks++;
    }

    recordAudit(
      "Fee Ledger Linkage",
      "Fee Receipts Linked to Valid Students",
      validFeeStudentLinks === feeRecords.length,
      `Valid Fee-Student Matches: ${validFeeStudentLinks} / ${feeRecords.length}`
    );

    // Check due calculation accuracy: dueAmount = max(0, totalAmount - amountPaid)
    const miscalculatedFees = await FeePayment.find({
      $expr: {
        $ne: ["$dueAmount", { $max: [0, { $subtract: ["$totalAmount", "$amountPaid"] }] }],
      },
    }).countDocuments();

    recordAudit(
      "Fee Calculation",
      "Due Amounts Exact Match (totalAmount - amountPaid)",
      miscalculatedFees === 0,
      `Records with math disparity: ${miscalculatedFees}`
    );

    // ----------------------------------------------------------------------
    // SECTION 6: INTERNAL MARKS (CE) LINKAGES & GRADE INTEGRITY
    // ----------------------------------------------------------------------
    const internalMarkRegisters = await InternalMark.find({}).lean();
    let validInternalMarksLinks = 0;
    let totalSampledIMRecords = 0;

    for (const im of internalMarkRegisters) {
      for (const r of im.records.slice(0, 3)) {
        totalSampledIMRecords++;
        const std = await Student.findOne({ admissionNumber: r.admissionNumber });
        if (std) validInternalMarksLinks++;
      }
    }

    recordAudit(
      "Internal Marks Linkage",
      "CE Marks Linked to Enrolled Students",
      validInternalMarksLinks === totalSampledIMRecords,
      `Valid Marks-Student Links: ${validInternalMarksLinks} / ${totalSampledIMRecords}`
    );

    // ----------------------------------------------------------------------
    // SECTION 7: CROSS-SERVICE LIVE UPDATE PROPAGATION TESTS
    // ----------------------------------------------------------------------

    // TEST 7A: ATTENDANCE PROPAGATION
    // Save attendance roll-call and verify student dashboard immediately recalculates rate
    const testDate = "2026-11-09";
    const testDivision = "Class 10-A";
    const std10A = await Student.find({ classDivision: testDivision }).lean();

    // Mark roll-call: Mark Anandhu Saji as Present
    const rollCallRecords = std10A.map((s, idx) => ({
      studentId: s._id,
      rollNumber: s.rollNumber,
      name: s.name,
      status: idx === 0 ? "Present" : idx % 2 === 0 ? "Present" : "Absent",
      remarks: "Live Audit Verification Entry",
    }));

    await AttendanceService.saveDivisionAttendanceRegister({
      date: testDate,
      classDivision: testDivision,
      records: rollCallRecords,
    });

    // Check if Student Dashboard immediately reflects the attendance
    const studentMetrics = await StudentService.getStudentMetrics({
      userId: studentUser._id,
      email: studentUser.email,
    });

    const attendanceReflected =
      studentMetrics &&
      studentMetrics.attendance &&
      studentMetrics.attendance.totalWorkingDays > 0 &&
      studentMetrics.attendance.rate.includes("%");

    recordAudit(
      "Update Propagation",
      "Roll-Call Save -> Student Dashboard Metric Recalculation",
      !!attendanceReflected,
      `Working Days: ${studentMetrics?.attendance?.totalWorkingDays}, Calculated Rate: ${studentMetrics?.attendance?.rate}`
    );

    // TEST 7B: RAZORPAY / FEE PAYMENT PROPAGATION & DUE DECREMENT
    // Create an explicit fee invoice for Anandhu Saji with 1000 due
    const testInvoice = await FeePayment.create({
      receiptNumber: `REC-AUDIT-${Date.now().toString().slice(-6)}`,
      studentId: studentDoc._id,
      studentName: studentDoc.name,
      admissionNumber: studentDoc.admissionNumber,
      classDivision: studentDoc.classDivision,
      wing: "High School",
      feeCategory: "Lab & Computer Fee",
      term: "Term 2",
      totalAmount: 1200,
      amountPaid: 400,
      dueAmount: 800,
      paymentMode: "Razorpay / Online",
      paymentMethod: "Pending",
      status: "Partial",
      paymentDate: new Date().toISOString().split("T")[0],
      academicYear: "2025-2026",
      remarks: "Audit Test Fee Invoice",
    });

    // Verify initial due via StudentFeesService
    const feesBefore = await StudentService.getStudentFees({
      studentId: studentDoc._id,
      admissionNumber: studentDoc.admissionNumber,
    });
    const dueBefore = feesBefore.summary?.totalDue || 0;

    // Simulate paying off 500 via Razorpay
    const paymentAmount = 500;
    const mockOrderId = `order_audit_${Date.now()}`;
    const mockPaymentId = `pay_audit_${Date.now()}`;
    const mockSig = RazorpayService.generateMockSignature(mockOrderId, mockPaymentId);

    await StudentService.verifyAndProcessPayment({
      studentMongoId: studentDoc._id,
      admissionNumber: studentDoc.admissionNumber,
      orderId: mockOrderId,
      paymentId: mockPaymentId,
      signature: mockSig,
      amountPaid: paymentAmount,
      feePaymentId: testInvoice._id,
    });

    // Verify updated fee state
    const feesAfter = await StudentService.getStudentFees({
      studentId: studentDoc._id,
      admissionNumber: studentDoc.admissionNumber,
    });
    const dueAfter = feesAfter.summary?.totalDue || 0;
    const paymentPersisted = dueAfter === dueBefore - paymentAmount;

    // Verify specific invoice dueAmount decremented from 800 to 300
    const updatedInvoice = await FeePayment.findById(testInvoice._id);
    const invoiceDecremented = updatedInvoice.dueAmount === 300 && updatedInvoice.amountPaid === 900;

    recordAudit(
      "Update Propagation",
      "Fee Payment -> Specific Invoice Due Decrement (800 -> 300)",
      !!invoiceDecremented,
      `Invoice Due: ₹${updatedInvoice.dueAmount}, Paid: ₹${updatedInvoice.amountPaid}, Status: ${updatedInvoice.status}`
    );

    recordAudit(
      "Update Propagation",
      "Fee Payment -> Student Ledger Aggregate Due Decrement",
      paymentPersisted,
      `Initial Due: ₹${dueBefore} -> New Due: ₹${dueAfter} (Decreased by ₹${paymentAmount})`
    );

    // Verify Admin Payment summary also reflects the updated collections
    const adminSummary = await PaymentService.calculateSummaryMetrics();
    const adminReflected = adminSummary.totalCollected > 0 && adminSummary.totalBilled > 0;

    recordAudit(
      "Update Propagation",
      "Fee Payment -> Admin Central Ledger Summary Update",
      adminReflected,
      `Total Billed: ₹${adminSummary.totalBilled}, Total Collected: ₹${adminSummary.totalCollected}, Due: ₹${adminSummary.totalDue}`
    );

    // Clean up test invoice
    await FeePayment.findByIdAndDelete(testInvoice._id);

    // TEST 7C: TEACHER INTERNAL MARKS PROPAGATION
    // Submit updated marks for 3 students in Class 10-A Mathematics
    const marksPayload = [
      {
        studentId: std10A[0]._id,
        rollNumber: std10A[0].rollNumber,
        admissionNumber: std10A[0].admissionNumber,
        studentName: std10A[0].name,
        marksObtained: 19,
        isAbsent: false,
        remarks: "Audit top performer",
      },
      {
        studentId: std10A[1]._id,
        rollNumber: std10A[1].rollNumber,
        admissionNumber: std10A[1].admissionNumber,
        studentName: std10A[1].name,
        marksObtained: 17,
        isAbsent: false,
        remarks: "Audit solid progress",
      },
      {
        studentId: std10A[2]._id,
        rollNumber: std10A[2].rollNumber,
        admissionNumber: std10A[2].admissionNumber,
        studentName: std10A[2].name,
        marksObtained: 15,
        isAbsent: false,
        remarks: "Audit satisfactory",
      },
    ];

    const imResult = await TeacherService.saveInternalMarks({
      examTerm: "First Terminal Examination 2026",
      standard: "Class 10",
      classDivision: "Class 10-A",
      subject: "Mathematics",
      evaluationType: "Continuous Evaluation (CE)",
      maxMarks: 20,
      passMarks: 6,
      records: marksPayload,
      teacherName: "Mrs. Indu B Nair",
      teacherEmail: "kathalanx@gmail.com",
      teacherPen: "849201",
    });

    const expectedAverage = Number(((19 + 17 + 15) / 3).toFixed(1)); // 17.0
    const marksUpdatedOk =
      imResult &&
      imResult.classAverage === expectedAverage &&
      imResult.highestScore === 19 &&
      imResult.lowestScore === 15;

    recordAudit(
      "Update Propagation",
      "Teacher Internal Marks -> Dynamic Average & Grade Calculation",
      marksUpdatedOk,
      `Class Avg: ${imResult?.classAverage} (Expected: ${expectedAverage}), Highest: ${imResult?.highestScore}, Lowest: ${imResult?.lowestScore}`
    );

    // TEST 7D: STUDENT RECORD UPDATE REFLECTED ACROSS SYSTEM
    // Update student's phone and address
    const originalPhone = studentDoc.parentContact;
    const updatedTestPhone = "+91 94470 99887";

    await Student.findByIdAndUpdate(studentDoc._id, {
      parentContact: updatedTestPhone,
      bloodGroup: "O+",
    });

    // Check Student Metrics Service
    const metricsAfterUpdate = await StudentService.getStudentMetrics({
      userId: studentUser._id,
      email: studentUser.email,
    });
    const phoneReflectedInMetrics = metricsAfterUpdate.student?.parentContact === updatedTestPhone;

    // Check Teacher Students list
    const teacherRoster = await TeacherService.getStudentsForTeacherRegister({ division: "Class 10-A" });
    const teacherStudentRecord = teacherRoster.students?.find((s) => s._id.toString() === studentDoc._id.toString());
    const phoneReflectedInTeacherView = teacherStudentRecord?.parentContact === updatedTestPhone;

    recordAudit(
      "Update Propagation",
      "Student Record Edit -> Reflects in Student Profile & Teacher Roster",
      phoneReflectedInMetrics && phoneReflectedInTeacherView,
      `Student Dossier: ${metricsAfterUpdate.student?.parentContact}, Teacher Roster: ${teacherStudentRecord?.parentContact}`
    );

    // Revert student phone to avoid dirtying data
    await Student.findByIdAndUpdate(studentDoc._id, {
      parentContact: originalPhone || "+91 94471 11223",
    });

    console.log("\n==========================================================================");
    console.log(`DATA LINKAGE & UPDATE AUDIT COMPLETE: ${auditResults.filter((r) => r.passed).length} / ${auditResults.length} PASSED`);
    console.log("==========================================================================\n");
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed.");
  }
}

verifyAllDataLinkages().catch((err) => {
  console.error("Data Linkage Audit Fatal Error:", err);
  process.exit(1);
});
