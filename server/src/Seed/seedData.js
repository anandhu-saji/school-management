import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import Exam from "../models/Exam.js";
import FeePayment from "../models/FeePayment.js";
import InternalMark from "../models/InternalMark.js";
import { getFacultyCadre } from "./fixtures/facultyFixture.js";
import { generateStudentDocuments } from "./fixtures/studentFixture.js";
import { generateAttendanceDocuments } from "./fixtures/attendanceFixture.js";
import { examTimetables } from "./fixtures/examFixture.js";
import { generateFeeDocuments } from "./fixtures/feeFixture.js";
import { generateInternalMarks } from "./fixtures/marksFixture.js";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/ghss_student_portal?replicaSet=rs0";

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Master Seeding of all 26 Academic Divisions...");

    // -------------------------------------------------------------
    // 0. CLEAN & FIX LEGACY UNIQUE INDEXES
    // -------------------------------------------------------------
    try {
      const usersColl = mongoose.connection.collection("users");
      const userIndexes = await usersColl.indexes();
      if (userIndexes.some((idx) => idx.name === "username_1")) {
        await usersColl.dropIndex("username_1");
        console.log("[INFO] Dropped legacy index: username_1 from users.");
      }
    } catch (e) {
      // index does not exist or already dropped
    }

    try {
      const studentsColl = mongoose.connection.collection("students");
      const studentIndexes = await studentsColl.indexes();
      for (const idx of studentIndexes) {
        if (idx.name === "email_1") {
          await studentsColl.dropIndex("email_1");
          console.log("[INFO] Dropped non-sparse email_1 from students.");
        }
      }
      await studentsColl.createIndex({ email: 1 }, { unique: true, sparse: true });
      await studentsColl.createIndex({ admissionNumber: 1 }, { unique: true, sparse: true });
    } catch (e) {
      // fallback
    }

    try {
      const teachersColl = mongoose.connection.collection("teachers");
      const teacherIndexes = await teachersColl.indexes();
      for (const idx of teacherIndexes) {
        if (
          idx.name === "teacherId_1" ||
          (idx.name === "userId_1" && !idx.sparse) ||
          (idx.name === "email_1" && !idx.sparse) ||
          (idx.name === "pen_1" && !idx.sparse)
        ) {
          await teachersColl.dropIndex(idx.name);
          console.log(`[INFO] Dropped index: ${idx.name} from teachers.`);
        }
      }
      await teachersColl.createIndex({ userId: 1 }, { unique: true, sparse: true });
      await teachersColl.createIndex({ email: 1 }, { unique: true, sparse: true });
      await teachersColl.createIndex({ pen: 1 }, { unique: true, sparse: true });
    } catch (e) {
      // fallback
    }

    // -------------------------------------------------------------
    // 1. ENSURE CORE AUTH USERS
    // -------------------------------------------------------------
    // 1a. Super Admin (Headmaster)
    let adminUser = await User.findOne({ email: "admin@ghss.edu" });
    if (!adminUser) {
      adminUser = await User.create({
        name: "Headmaster Sri. K. R. Madhavan",
        username: "admin_ghss",
        email: "admin@ghss.edu",
        password: "Admin@123",
        role: "admin",
        isActive: true,
      });
      console.log("[OK] Created Admin User: admin@ghss.edu (Password: Admin@123)");
    } else {
      adminUser.password = "Admin@123";
      await adminUser.save();
      console.log("[OK] Refreshed Admin User password: admin@ghss.edu (Password: Admin@123)");
    }

    // 1b. Principal / Secondary Admin
    let principalUser = await User.findOne({ email: "principal@ghss.edu" });
    if (!principalUser) {
      principalUser = await User.create({
        name: "Principal Smt. V. S. Radhamani",
        username: "principal_ghss",
        email: "principal@ghss.edu",
        password: "Admin@12345",
        role: "admin",
        isActive: true,
      });
      console.log("[OK] Created Principal User: principal@ghss.edu (Password: Admin@12345)");
    }

    // 1c. Faculty Mentor: Class 10-A (Mathematics)
    let teacherUser = await User.findOne({ email: "kathalanx@gmail.com" });
    if (!teacherUser) {
      teacherUser = await User.create({
        name: "Mrs. Indu B Nair",
        username: "indu_teacher",
        email: "kathalanx@gmail.com",
        password: "Teacher@123",
        role: "teacher",
        isActive: true,
      });
      console.log("[OK] Created Faculty User: kathalanx@gmail.com (Password: Teacher@123)");
    } else {
      teacherUser.password = "Teacher@123";
      await teacherUser.save();
    }

    // 1d. Quick Demo Faculty Account
    let demoTeacherUser = await User.findOne({ email: "teacher@ghss.edu" });
    if (!demoTeacherUser) {
      demoTeacherUser = await User.create({
        name: "Mrs. Indu B Nair",
        username: "teacher_demo",
        email: "teacher@ghss.edu",
        password: "Teacher@123",
        role: "teacher",
        isActive: true,
      });
      console.log("[OK] Created Demo Teacher: teacher@ghss.edu (Password: Teacher@123)");
    } else {
      demoTeacherUser.password = "Teacher@123";
      await demoTeacherUser.save();
    }

    // 1e. Standard 10-A Scholar
    let studentUser = await User.findOne({ email: "student@ghss.edu" });
    if (!studentUser) {
      studentUser = await User.create({
        name: "Anandhu Saji",
        username: "anandhu_10a",
        email: "student@ghss.edu",
        password: "Student@123",
        role: "student",
        isActive: true,
      });
      console.log("[OK] Created Student User: student@ghss.edu (Password: Student@123)");
    } else {
      studentUser.password = "Student@123";
      await studentUser.save();
    }

    // 1f. Plus Two Higher Secondary Science Scholar
    let hssStudentUser = await User.findOne({ email: "hss_student@ghss.edu" });
    if (!hssStudentUser) {
      hssStudentUser = await User.create({
        name: "Rohit R. Chandran",
        username: "rohit_12sci",
        email: "hss_student@ghss.edu",
        password: "Student@123",
        role: "student",
        isActive: true,
      });
      console.log("[OK] Created HSS Scholar: hss_student@ghss.edu (Password: Student@123)");
    } else {
      hssStudentUser.password = "Student@123";
      await hssStudentUser.save();
    }

    // -------------------------------------------------------------
    // 2. SEED FACULTY CADRE (26 MENTORS ACROSS ALL ACADEMIC WINGS)
    // -------------------------------------------------------------
    const fullFacultyCadre = getFacultyCadre(teacherUser._id);
    for (const t of fullFacultyCadre) {
      await Teacher.findOneAndUpdate(
        { pen: t.pen },
        { $set: t },
        { upsert: true, returnDocument: "after" }
      );
    }
    console.log(`[OK] Upserted ${fullFacultyCadre.length} faculty mentors across all 26 classes in MongoDB.`);

    // -------------------------------------------------------------
    // 3. SEED STUDENTS FOR ALL 26 ACADEMIC DIVISIONS
    // -------------------------------------------------------------
    await Student.deleteMany({});
    console.log("[INFO] Cleared existing student collection for fresh multi-wing seed.");

    const allStudentsToInsert = generateStudentDocuments({
      studentUserId: studentUser._id,
      hssStudentUserId: hssStudentUser._id,
    });
    const insertedStudents = await Student.insertMany(allStudentsToInsert);
    console.log(`[OK] Seeded ${insertedStudents.length} students across all 26 classes in MongoDB!`);

    // -------------------------------------------------------------
    // 4. SEED DAILY MUSTER ATTENDANCE FOR ALL 26 CLASSES ACROSS PAST 10 DAYS
    // -------------------------------------------------------------
    await Attendance.deleteMany({});
    const attendanceDocsToInsert = generateAttendanceDocuments(insertedStudents);
    await Attendance.insertMany(attendanceDocsToInsert);
    console.log(`[OK] Seeded ${attendanceDocsToInsert.length} daily attendance registers across 10 academic days in MongoDB.`);

    // -------------------------------------------------------------
    // 5. SEED EXAM TIMETABLES & SEATING PLANS ACROSS ALL WINGS
    // -------------------------------------------------------------
    await Exam.deleteMany({});
    await Exam.insertMany(examTimetables);
    console.log(`[OK] Seeded ${examTimetables.length} exam schedules across all standards in MongoDB!`);

    // -------------------------------------------------------------
    // 6. SEED OFFICIAL FEE PAYMENTS ACROSS DIVISIONS (INCLUDING LIVE RAZORPAY)
    // -------------------------------------------------------------
    await FeePayment.deleteMany({});
    const feeDocsToInsert = generateFeeDocuments(insertedStudents);
    await FeePayment.insertMany(feeDocsToInsert);
    console.log(`[OK] Seeded ${feeDocsToInsert.length} fee transaction records in MongoDB!`);

    // -------------------------------------------------------------
    // 7. SEED CONTINUOUS EVALUATION (CE) & INTERNAL MARKS
    // -------------------------------------------------------------
    await InternalMark.deleteMany({});
    const internalMarksToInsert = generateInternalMarks(insertedStudents);
    if (internalMarksToInsert.length > 0) {
      await InternalMark.insertMany(internalMarksToInsert);
      console.log(`[OK] Seeded ${internalMarksToInsert.length} internal evaluation mark registers in MongoDB!`);
    }

    console.log("\n========================================================");
    console.log("       [SUCCESS] MASTER SEEDING COMPLETED SUCCESSFULLY!        ");
    console.log("========================================================");
    console.log("  TOTAL ACADEMIC WINGS       : 4 Wings (LP, UP, HS, HSS)");
    console.log("  TOTAL ACADEMIC DIVISIONS   : 26 Divisions");
    console.log(`  TOTAL STUDENTS SEEDED      : ${insertedStudents.length}`);
    console.log(`  TOTAL TEACHERS / MENTORS   : ${fullFacultyCadre.length}`);
    console.log(`  TOTAL ATTENDANCE REGISTERS : ${attendanceDocsToInsert.length}`);
    console.log(`  TOTAL EXAM SCHEDULES       : ${examTimetables.length}`);
    console.log(`  TOTAL FEE PAYMENTS         : ${feeDocsToInsert.length}`);
    console.log(`  TOTAL INTERNAL MARK PAPERS : ${internalMarksToInsert.length}`);
    console.log("--------------------------------------------------------");
    console.log(`  LOGIN CREDENTIALS:
  - Super Admin (Headmaster)    : admin@ghss.edu                     / Admin@123 (or Admin@12345)
  - Secondary Admin (Principal) : principal@ghss.edu                 / Admin@12345
  - Faculty Mentor (10-A Math)  : kathalanx@gmail.com                / Teacher@123
  - Quick Demo Teacher          : teacher@ghss.edu                   / Teacher@123
  - Faculty Mentor (12-Sci)     : manoj.p@ghssrajakkad.kerala.gov.in / Teacher@123
  - Student Scholar (10-A)      : student@ghss.edu                   / Student@123
  - Student Scholar (12-Sci)    : hss_student@ghss.edu               / Student@123
========================================================\n`);

    process.exit(0);
  } catch (error) {
    console.error("[ERROR] Master Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
