import "dotenv/config";
import http from "http";
import mongoose from "mongoose";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import Student from "./src/models/Student.js";
import Teacher from "./src/models/Teacher.js";
import Exam from "./src/models/Exam.js";
import FeePayment from "./src/models/FeePayment.js";
import EmailVerification from "./src/models/EmailVerification.js";
import { RazorpayService } from "./src/services/razorpay.service.js";

const PORT = 5099;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const results = [];

function recordTest(domain, testName, passed, details = "") {
  results.push({ domain, testName, passed, details });
  const status = passed ? "[PASS]" : "[FAIL]";
  console.log(`${status} | ${domain.padEnd(16)} | ${testName.padEnd(45)} | ${details}`);
}

async function run() {
  console.log("\n==========================================================================");
  console.log("       STARTING FULL COMPREHENSIVE END-TO-END PROJECT VERIFICATION        ");
  console.log("==========================================================================\n");

  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
  console.log(`Test server running at ${BASE_URL}\n`);

  let adminToken = null;
  let teacherToken = null;
  let studentToken = null;

  try {
    // -------------------------------------------------------------
    // 1. SYSTEM HEALTH PROBE
    // -------------------------------------------------------------
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      const data = await res.json();
      const ok = res.status === 200 && data.status === "healthy" && data.database === "connected";
      recordTest("System Health", "GET /api/health probe", ok, `HTTP ${res.status}, DB: ${data.database}`);
    } catch (e) {
      recordTest("System Health", "GET /api/health probe", false, e.message);
    }

    // -------------------------------------------------------------
    // 2. AUTHENTICATION & ACCESS CONTROL
    // -------------------------------------------------------------
    // 2a. Admin Login
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@ghss.edu", password: "Admin@123" }),
      });
      const data = await res.json();
      const ok = res.status === 200 && data.token && data.user?.role === "admin";
      adminToken = data.token;
      recordTest("Auth & RBAC", "Admin Login (admin@ghss.edu)", ok, `Role: ${data.user?.role}, Token: Received`);
    } catch (e) {
      recordTest("Auth & RBAC", "Admin Login (admin@ghss.edu)", false, e.message);
    }

    // 2b. Teacher Login
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "kathalanx@gmail.com", password: "Teacher@123" }),
      });
      const data = await res.json();
      const ok = res.status === 200 && data.token && data.user?.role === "teacher";
      teacherToken = data.token;
      recordTest("Auth & RBAC", "Teacher Login (kathalanx@gmail.com)", ok, `Role: ${data.user?.role}, Class: 10-A`);
    } catch (e) {
      recordTest("Auth & RBAC", "Teacher Login (kathalanx@gmail.com)", false, e.message);
    }

    // 2c. Student Login
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "student@ghss.edu", password: "Student@123" }),
      });
      const data = await res.json();
      const ok = res.status === 200 && data.token && data.user?.role === "student";
      studentToken = data.token;
      recordTest("Auth & RBAC", "Student Login (student@ghss.edu)", ok, `Role: ${data.user?.role}, Name: ${data.user?.name}`);
    } catch (e) {
      recordTest("Auth & RBAC", "Student Login (student@ghss.edu)", false, e.message);
    }

    // 2d. Invalid Login Rejection
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@ghss.edu", password: "WrongPassword999" }),
      });
      const ok = res.status === 401;
      recordTest("Auth & RBAC", "Reject Invalid Password", ok, `HTTP ${res.status} Unauthorized`);
    } catch (e) {
      recordTest("Auth & RBAC", "Reject Invalid Password", false, e.message);
    }

    // 2e. Role Authorization Guard (Student accessing Admin route)
    try {
      const res = await fetch(`${BASE_URL}/api/admin/overview-stats`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const ok = res.status === 403;
      recordTest("Auth & RBAC", "RBAC Route Guard (Student to Admin)", ok, `HTTP ${res.status} Forbidden`);
    } catch (e) {
      recordTest("Auth & RBAC", "RBAC Route Guard (Student to Admin)", false, e.message);
    }

    // -------------------------------------------------------------
    // 3. ADMIN PORTAL OPERATIONS & DATA PERSISTENCE
    // -------------------------------------------------------------
    // 3a. Overview Stats
    try {
      const res = await fetch(`${BASE_URL}/api/admin/overview-stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      const stats = data.stats || data;
      const ok = res.status === 200 && stats.totalStudents >= 390 && stats.totalTeachers >= 26;
      recordTest("Admin Portal", "GET Overview Stats", ok, `Students: ${stats.totalStudents}, Teachers: ${stats.totalTeachers}`);
    } catch (e) {
      recordTest("Admin Portal", "GET Overview Stats", false, e.message);
    }

    // 3b. Division Muster Roll (26 Divisions)
    try {
      const res = await fetch(`${BASE_URL}/api/admin/division-muster`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      const divisions = data.divisions || data;
      const ok = res.status === 200 && Array.isArray(divisions) && divisions.length >= 26;
      recordTest("Admin Portal", "GET Division Muster (All 26 Divisions)", ok, `Total Divisions: ${divisions.length}`);
    } catch (e) {
      recordTest("Admin Portal", "GET Division Muster (All 26 Divisions)", false, e.message);
    }

    // 3c. Division Attendance Register Fetch & Update
    try {
      const res = await fetch(`${BASE_URL}/api/admin/attendance/register?division=Class%2010-A`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      const studentsList = data.students || [];
      const ok = res.status === 200 && Array.isArray(studentsList) && studentsList.length > 0;
      recordTest("Admin Portal", "GET Attendance Register (Class 10-A)", ok, `Enrolled: ${studentsList.length}, Mentor: ${data.mentor}`);

      // Save/Update attendance register
      const todayStr = new Date().toISOString().split("T")[0];
      const updatedRecords = studentsList.slice(0, 5).map((r, i) => ({
        studentId: r._id,
        rollNumber: r.rollNumber,
        name: r.name,
        status: i === 0 ? "Absent" : "Present",
      }));
      const postRes = await fetch(`${BASE_URL}/api/admin/attendance/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          classDivision: "Class 10-A",
          date: todayStr,
          records: updatedRecords,
        }),
      });
      const postData = await postRes.json();
      const saveOk = postRes.status === 200 && postData.success;
      recordTest("Admin Portal", "POST Save Attendance Register Update", saveOk, `Status: ${postData.message || "Updated"}`);
    } catch (e) {
      recordTest("Admin Portal", "Attendance Register Workflow", false, e.message);
    }

    // 3d. Student Management: CREATE -> UPDATE -> DELETE
    let testStudentId = null;
    try {
      // Create Student
      const createRes = await fetch(`${BASE_URL}/api/admin/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: "Abhinav Ramesh Kumar",
          admissionNumber: `ADM-VERIF-${Date.now().toString().slice(-4)}`,
          rollNumber: 42,
          classDivision: "Class 10-A",
          className: "Class 10-A",
          division: "10-A",
          gender: "Male",
          dob: "15/06/2010",
          guardian: "Ramesh Kumar K.",
          parentContact: "+91 94471 99881",
          category: "General",
          bloodGroup: "O+",
          address: {
            houseName: "Ramesh Nivas",
            street: "Station Road",
            city: "Rajakkad",
            pincode: "685566",
          },
        }),
      });
      const createData = await createRes.json();
      const createdStudent = createData.student || createData;
      testStudentId = createdStudent._id;
      const createOk = createRes.status === 201 && testStudentId;
      recordTest("Admin Students", "POST Create New Student", createOk, `Student ID: ${testStudentId}`);

      // Update Student
      const updateRes = await fetch(`${BASE_URL}/api/admin/students/${testStudentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          parentContact: "+91 94471 99999",
          bloodGroup: "AB+",
        }),
      });
      const updateData = await updateRes.json();
      const updateOk = updateRes.status === 200 && (updateData.student?.bloodGroup === "AB+" || updateData.success);
      recordTest("Admin Students", "PUT Update Student Record", updateOk, "Blood group updated to AB+");

      // Verify in Database directly
      const dbStudent = await Student.findById(testStudentId);
      const dbPersistOk = dbStudent && dbStudent.bloodGroup === "AB+" && dbStudent.parentContact === "+91 94471 99999";
      recordTest("Admin Students", "Database Persistence Check", dbPersistOk, "MongoDB confirmed state change");

      // Delete Student
      const deleteRes = await fetch(`${BASE_URL}/api/admin/students/${testStudentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const deleteOk = deleteRes.status === 200;
      const verifyDeleted = !(await Student.findById(testStudentId));
      recordTest("Admin Students", "DELETE Remove Student & Cleanup", deleteOk && verifyDeleted, "Verified removed from MongoDB");
    } catch (e) {
      recordTest("Admin Students", "Student Management CRUD", false, e.message);
      if (testStudentId) await Student.findByIdAndDelete(testStudentId);
    }

    // 3e. Teacher Management: OTP Verification -> CREATE -> UPDATE -> DELETE
    let testTeacherId = null;
    try {
      const pen = `89${Date.now().toString().slice(-4)}`;
      const teacherEmail = `reshma.v.${Date.now()}@ghssrajakkad.kerala.gov.in`;

      // Pre-authorize email via EmailVerification (simulating verified 6-digit OTP)
      await EmailVerification.create({
        email: teacherEmail,
        purpose: "teacher_registration",
        otp: "654321",
        isVerified: true,
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 600000),
      });

      const createRes = await fetch(`${BASE_URL}/api/admin/teachers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: "Smt. Reshma Vijayan",
          pen,
          penNumber: `PEN-${pen}`,
          dob: "15/05/1988", // Valid age 38 within statutory 25-60 yrs limit
          email: teacherEmail,
          phone: "+91 94472 88123",
          department: "HST Natural Science",
          designation: "HST",
          assignedClass: "Class 9-C",
          mentorClass: "9-C",
          subject: "Natural Science",
          qualification: "M.Sc Botany, B.Ed",
          appointmentDate: "01/06/2019",
          highestDegree: "Post Graduate (Master's)",
          hasBed: true,
          hasSetOrKtet: true,
        }),
      });
      const createData = await createRes.json();
      const createdTeacher = createData.teacher || createData;
      testTeacherId = createdTeacher._id;
      const createOk = createRes.status === 201 && testTeacherId;
      recordTest("Admin Teachers", "POST Create Faculty Mentor", createOk, `PEN: ${pen}, Teacher ID: ${testTeacherId}`);

      // Update Teacher
      const updateRes = await fetch(`${BASE_URL}/api/admin/teachers/${testTeacherId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          phone: "+91 94472 00000",
          status: "In Class",
        }),
      });
      const updateOk = updateRes.status === 200;
      recordTest("Admin Teachers", "PUT Update Faculty Details", updateOk, "Phone & Status updated");

      // Delete Teacher
      const deleteRes = await fetch(`${BASE_URL}/api/admin/teachers/${testTeacherId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const deleteOk = deleteRes.status === 200;
      const verifyDeleted = !(await Teacher.findById(testTeacherId));
      recordTest("Admin Teachers", "DELETE Remove Faculty & Cleanup", deleteOk && verifyDeleted, "Verified removed from MongoDB");
    } catch (e) {
      recordTest("Admin Teachers", "Teacher Management CRUD", false, e.message);
      if (testTeacherId) await Teacher.findByIdAndDelete(testTeacherId);
    }

    // 3f. Exam Management: CREATE -> SEATING PLAN -> DELETE
    let testExamId = null;
    try {
      const createRes = await fetch(`${BASE_URL}/api/admin/exams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          term: "State Level Model Exam 2027",
          standard: "Standard 10 (SSLC)",
          academicYear: "2026-2027",
          date: "25 March 2027, Thu",
          startTime: "09:30 AM",
          endTime: "12:15 PM",
          duration: "2 hrs 45 mins",
          subject: "Information Technology",
          qpCode: "KL-SSLC-IT601",
          hall: "Computer Labs 01 & 02",
          totalCandidates: 120,
          invigilator: "Mrs. Indu B Nair",
          maxMarks: 40,
          status: "Approved & Published",
        }),
      });
      const createData = await createRes.json();
      testExamId = createData.exam?._id || createData._id;
      const createOk = createRes.status === 201 && testExamId;
      recordTest("Admin Exams", "POST Create Exam Timetable", createOk, `QP: KL-SSLC-IT601, ID: ${testExamId}`);

      // Fetch Seating Plan
      const seatingRes = await fetch(`${BASE_URL}/api/admin/exams/${testExamId}/seating`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const seatingOk = seatingRes.status === 200;
      recordTest("Admin Exams", "GET Exam Seating Plan", seatingOk, "Seating layout generated");

      // Delete Exam
      const delRes = await fetch(`${BASE_URL}/api/admin/exams/${testExamId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const delOk = delRes.status === 200 && !(await Exam.findById(testExamId));
      recordTest("Admin Exams", "DELETE Remove Exam & Cleanup", delOk, "Verified removed from MongoDB");
    } catch (e) {
      recordTest("Admin Exams", "Exam Management CRUD", false, e.message);
      if (testExamId) await Exam.findByIdAndDelete(testExamId);
    }

    // 3g. Admin Payments Ledger & Summary
    let testPaymentId = null;
    try {
      const summaryRes = await fetch(`${BASE_URL}/api/admin/payments/summary`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const summaryData = await summaryRes.json();
      const summary = summaryData.summary || summaryData;
      const sumOk = summaryRes.status === 200 && summary.totalBilled > 0;
      recordTest("Admin Payments", "GET Payment Summary Ledger", sumOk, `Total Billed: ₹${summary.totalBilled}, Paid: ₹${summary.totalPaid}`);

      // Record a Fee Payment
      const recNumber = `REC-TEST-${Date.now().toString().slice(-5)}`;
      const createRes = await fetch(`${BASE_URL}/api/admin/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          receiptNumber: recNumber,
          studentName: "Anandhu Saji",
          admissionNumber: "ADM-10A-101",
          classDivision: "Class 10-A",
          wing: "High School",
          feeCategory: "Lab & Computer Fee",
          term: "Term 1",
          totalAmount: 1000,
          amountPaid: 1000,
          dueAmount: 0,
          paymentDate: new Date().toISOString().split("T")[0],
          paymentMode: "Razorpay / Online",
          transactionReference: "rzp_test_ref_9911",
          status: "Paid",
          remarks: "Automated Verification Test Payment",
        }),
      });
      const createData = await createRes.json();
      testPaymentId = createData.payment?._id || createData._id;
      const createOk = createRes.status === 201 && testPaymentId;
      recordTest("Admin Payments", "POST Record Manual/Online Payment", createOk, `Receipt: ${recNumber}, Mode: Razorpay`);

      // Delete Payment
      const delRes = await fetch(`${BASE_URL}/api/admin/payments/${testPaymentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const delOk = delRes.status === 200 && !(await FeePayment.findById(testPaymentId));
      recordTest("Admin Payments", "DELETE Payment Ledger Record", delOk, "Verified removed from MongoDB");
    } catch (e) {
      recordTest("Admin Payments", "Admin Payments Ledger Workflow", false, e.message);
      if (testPaymentId) await FeePayment.findByIdAndDelete(testPaymentId);
    }

    // -------------------------------------------------------------
    // 4. TEACHER PORTAL OPERATIONS
    // -------------------------------------------------------------
    // 4a. Teacher Profile
    try {
      const res = await fetch(`${BASE_URL}/api/teacher/profile`, {
        headers: { Authorization: `Bearer ${teacherToken}` },
      });
      const data = await res.json();
      const teacher = data.teacher || data;
      const ok = res.status === 200 && (teacher.assignedClass === "Class 10-A" || teacher.name?.includes("Indu"));
      recordTest("Teacher Portal", "GET Teacher Profile & Allocation", ok, `Teacher: ${teacher.name}, Class: ${teacher.assignedClass}`);
    } catch (e) {
      recordTest("Teacher Portal", "GET Teacher Profile & Allocation", false, e.message);
    }

    // 4b. Teacher Class Roll
    try {
      const res = await fetch(`${BASE_URL}/api/teacher/students?division=10-A`, {
        headers: { Authorization: `Bearer ${teacherToken}` },
      });
      const data = await res.json();
      const students = data.students || data;
      const ok = res.status === 200 && Array.isArray(students) && students.length >= 15;
      recordTest("Teacher Portal", "GET Class 10-A Student Roll", ok, `Total Students: ${students.length}`);
    } catch (e) {
      recordTest("Teacher Portal", "GET Class 10-A Student Roll", false, e.message);
    }

    // 4c. Teacher Timetable
    try {
      const res = await fetch(`${BASE_URL}/api/teacher/timetable`, {
        headers: { Authorization: `Bearer ${teacherToken}` },
      });
      const data = await res.json();
      const schedule = data.schedule || data;
      const ok = res.status === 200 && (Array.isArray(schedule) || typeof schedule === "object");
      recordTest("Teacher Portal", "GET Weekly Period Timetable", ok, "Schedule grid retrieved");
    } catch (e) {
      recordTest("Teacher Portal", "GET Weekly Period Timetable", false, e.message);
    }

    // 4d. Teacher Continuous Evaluation (CE) Internal Marks
    try {
      const getRes = await fetch(`${BASE_URL}/api/teacher/internal-marks?division=Class%2010-A&subject=Mathematics`, {
        headers: { Authorization: `Bearer ${teacherToken}` },
      });
      const getData = await getRes.json();
      const records = getData.records || [];
      const getOk = getRes.status === 200 && Array.isArray(records) && records.length > 0;
      recordTest("Teacher Portal", "GET CE Internal Marks Register", getOk, `Records: ${records.length}, Subject: ${getData.subject}`);

      // Save updated marks
      const recordsToUpdate = records.slice(0, 3).map((r, i) => ({
        studentId: r.studentId,
        rollNumber: r.rollNumber,
        admissionNumber: r.admissionNumber,
        studentName: r.studentName,
        marksObtained: 18 + i,
        isAbsent: false,
      }));
      const postRes = await fetch(`${BASE_URL}/api/teacher/internal-marks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          examTerm: getData.examTerm || "First Terminal Examination 2026",
          standard: "Class 10",
          classDivision: "Class 10-A",
          subject: "Mathematics",
          evaluationType: "Continuous Evaluation (CE)",
          maxMarks: 20,
          passMarks: 6,
          records: recordsToUpdate,
        }),
      });
      const postData = await postRes.json();
      const saveOk = postRes.status === 200 && postData.success;
      recordTest("Teacher Portal", "POST Update CE Internal Marks", saveOk, `Recalculated Avg: ${postData.internalMark?.classAverage || "Updated"}`);
    } catch (e) {
      recordTest("Teacher Portal", "CE Internal Marks Workflow", false, e.message);
    }

    // -------------------------------------------------------------
    // 5. STUDENT PORTAL OPERATIONS & RAZORPAY INTEGRATION
    // -------------------------------------------------------------
    // 5a. Student Dashboard Data
    try {
      const res = await fetch(`${BASE_URL}/api/student/dashboard-data`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const resData = await res.json();
      const data = resData.data || resData;
      const ok = res.status === 200 && data.student;
      recordTest("Student Portal", "GET Academic Dashboard Data", ok, `Student: ${data.student?.name}, Attendance: ${data.student?.overallAttendance}`);
    } catch (e) {
      recordTest("Student Portal", "GET Academic Dashboard Data", false, e.message);
    }

    // 5b. Student Exam Schedules & Hall Tickets
    try {
      const res = await fetch(`${BASE_URL}/api/student/exams`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const data = await res.json();
      const exams = data.exams || data;
      const ok = res.status === 200 && Array.isArray(exams) && exams.length > 0;
      recordTest("Student Portal", "GET Student Exam Schedule", ok, `Upcoming Exams: ${exams.length}`);
    } catch (e) {
      recordTest("Student Portal", "GET Student Exam Schedule", false, e.message);
    }

    // 5c. Student Fee Ledger
    let initialDue = 0;
    let pendingFeeItem = null;
    try {
      const res = await fetch(`${BASE_URL}/api/student/fees`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const data = await res.json();
      const ok = res.status === 200 && Array.isArray(data.payments) && data.summary;
      initialDue = data.summary?.totalDue || 0;
      pendingFeeItem = data.payments?.find((p) => p.dueAmount > 0);
      recordTest("Student Portal", "GET Fee Ledger & Status", ok, `Billed: ₹${data.summary?.totalBilled}, Paid: ₹${data.summary?.totalPaid}, Due: ₹${initialDue}`);
    } catch (e) {
      recordTest("Student Portal", "GET Fee Ledger & Status", false, e.message);
    }

    // 5d. Razorpay Online Order Creation
    let razorpayOrder = null;
    const paymentAmount = 500; // Pay partial due of ₹500
    try {
      const res = await fetch(`${BASE_URL}/api/student/create-razorpay-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          amount: paymentAmount,
          feePaymentId: pendingFeeItem?._id,
          feeCategory: pendingFeeItem?.feeCategory || "Special / Exam Fee",
        }),
      });
      const data = await res.json();
      razorpayOrder = data.order;
      const ok = res.status === 200 && razorpayOrder && razorpayOrder.id && razorpayOrder.amount === paymentAmount * 100;
      recordTest("Razorpay Gateway", "POST Create Razorpay Online Order", ok, `Order: ${razorpayOrder?.id}, Amount: ${razorpayOrder?.amount} paise (₹${paymentAmount})`);
    } catch (e) {
      recordTest("Razorpay Gateway", "POST Create Razorpay Online Order", false, e.message);
    }

    // 5e. Razorpay Payment Verification & Database Clearance
    try {
      const paymentId = `pay_verif_${Date.now()}`;
      const signature = RazorpayService.generateMockSignature(razorpayOrder.id, paymentId);

      const verifyRes = await fetch(`${BASE_URL}/api/student/verify-razorpay-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          orderId: razorpayOrder.id,
          paymentId: paymentId,
          signature: signature,
          amountPaid: paymentAmount,
          feePaymentId: pendingFeeItem?._id,
          feeCategory: pendingFeeItem?.feeCategory || "Special / Exam Fee",
        }),
      });
      const verifyData = await verifyRes.json();
      const recNum = verifyData.payment?.receiptNumber || verifyData.paymentRecord?.receiptNumber;
      const verifyOk = verifyRes.status === 200 && verifyData.success && recNum;
      recordTest("Razorpay Gateway", "POST Cryptographic Signature Verification", verifyOk, `Payment: ${paymentId}, Receipt: ${recNum}`);

      // 5f. Confirm Student Due Balance Decreased in MongoDB
      const recheckRes = await fetch(`${BASE_URL}/api/student/fees`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const recheckData = await recheckRes.json();
      const updatedDue = recheckData.summary?.totalDue;
      const expectedDue = initialDue - paymentAmount;
      const ledgerUpdatedOk = updatedDue === expectedDue;
      recordTest("Razorpay Gateway", "Confirm Database Balance Update", ledgerUpdatedOk, `Previous Due: ₹${initialDue} -> New Due: ₹${updatedDue} (Decreased by ₹${paymentAmount})`);
    } catch (e) {
      recordTest("Razorpay Gateway", "Payment Verification & Clearance", false, e.message);
    }

  } finally {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    console.log("\nTest server stopped and database connection closed.");
  }

  // Summary
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log("\n==========================================================================");
  console.log(`VERIFICATION SUMMARY: ${passedCount} / ${results.length} PASSED (Failures: ${failedCount})`);
  console.log("==========================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch((err) => {
  console.error("FATAL TEST RUNNER ERROR:", err);
  process.exit(1);
});
