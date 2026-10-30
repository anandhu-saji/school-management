import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/ghss_student_portal?replicaSet=rs0";

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for master seeding...");

    // 0. Drop legacy unique indexes that conflict with multiple records
    try {
      const usersColl = mongoose.connection.collection("users");
      const userIndexes = await usersColl.indexes();
      if (userIndexes.some((idx) => idx.name === "username_1")) {
        await usersColl.dropIndex("username_1");
        console.log("ℹ️ Dropped legacy unique index: username_1 from users collection.");
      }
    } catch (e) {
      // index does not exist or already dropped
    }

    try {
      const studentsColl = mongoose.connection.collection("students");
      const studentIndexes = await studentsColl.indexes();
      if (studentIndexes.some((idx) => idx.name === "email_1")) {
        await studentsColl.dropIndex("email_1");
        console.log("ℹ️ Dropped legacy unique index: email_1 from students collection.");
      }
    } catch (e) {
      // index does not exist or already dropped
    }

    // 1. Clean existing records for this division
    await Student.deleteMany({ classDivision: "Class 10-A" });
    await Attendance.deleteMany({ classDivision: "Class 10-A" });

    // 2. Ensure Admin User Account Exists
    let adminUser = await User.findOne({ email: "admin@ghss.edu" });
    if (!adminUser) {
      adminUser = await User.create({
        name: "Super Admin",
        username: "admin_ghss",
        email: "admin@ghss.edu",
        password: "Admin@12345",
        role: "admin",
        isActive: true,
      });
    }

    // 3. Ensure Teacher Account & Profile Exist
    let teacherUser = await User.findOne({ email: "kathalanx@gmail.com" });
    if (!teacherUser) {
      teacherUser = await User.create({
        name: "Indu B Nair",
        username: "indubnair",
        email: "kathalanx@gmail.com",
        password: "Teacher@123",
        role: "teacher",
        isActive: true,
      });
    }

    await Teacher.deleteMany({ email: "kathalanx@gmail.com" });
    await Teacher.create({
      userId: teacherUser._id,
      name: "Indu B Nair",
      email: "kathalanx@gmail.com",
      assignedClass: "Class 10-A",
      mentorClass: "Class 10-A",
      department: "Mathematics",
      phone: "+91 98470 12345",
      isActive: true,
    });

    // 4. Ensure Test Student Login Account Exists
    let studentUser = await User.findOne({
      $or: [
        { email: "student@ghss.edu" },
        { username: "Anandhu Saji" },
        { username: "anandhusaji" },
      ],
    });

    if (studentUser) {
      studentUser.name = "Anandhu Saji";
      studentUser.username = "anandhusaji";
      studentUser.email = "student@ghss.edu";
      studentUser.password = "Student@123";
      studentUser.role = "student";
      studentUser.isActive = true;
      await studentUser.save();
      console.log("✅ Updated existing student user account.");
    } else {
      studentUser = await User.create({
        name: "Anandhu Saji",
        username: "anandhusaji",
        email: "student@ghss.edu",
        password: "Student@123",
        role: "student",
        isActive: true,
      });
      console.log("✅ Created student user account.");
    }

    // 5. Seed 20 Students for Class 10-A
    const rawStudents = [
      { rollNumber: 1, name: "Aaron Biju", gender: "Male", monthlyLeavesTaken: 0 },
      { rollNumber: 2, name: "Anandhu Saji", gender: "Male", monthlyLeavesTaken: 1 },
      { rollNumber: 3, name: "Aswin Shiju", gender: "Male", monthlyLeavesTaken: 0 },
      { rollNumber: 4, name: "Basil Jomon", gender: "Male", monthlyLeavesTaken: 2 },
      { rollNumber: 5, name: "Ben Subash", gender: "Male", monthlyLeavesTaken: 0 },
      { rollNumber: 6, name: "Benidict James", gender: "Male", monthlyLeavesTaken: 1 },
      { rollNumber: 7, name: "Domenic James", gender: "Male", monthlyLeavesTaken: 0 },
      { rollNumber: 8, name: "Emmanual Binoy", gender: "Male", monthlyLeavesTaken: 0 },
      { rollNumber: 9, name: "Thomaskutty A", gender: "Male", monthlyLeavesTaken: 3 },
      { rollNumber: 10, name: "R Balagopal", gender: "Male", monthlyLeavesTaken: 0 },
      { rollNumber: 11, name: "Ashna Joshi", gender: "Female", monthlyLeavesTaken: 1 },
      { rollNumber: 12, name: "Aswani Biju", gender: "Female", monthlyLeavesTaken: 0 },
      { rollNumber: 13, name: "Aswathi Baby", gender: "Female", monthlyLeavesTaken: 2 },
      { rollNumber: 14, name: "Devika PT", gender: "Female", monthlyLeavesTaken: 0 },
      { rollNumber: 15, name: "Jewal Joby", gender: "Female", monthlyLeavesTaken: 0 },
      { rollNumber: 16, name: "Krishnendhu B", gender: "Female", monthlyLeavesTaken: 1 },
      { rollNumber: 17, name: "Sadhika Santhosh", gender: "Female", monthlyLeavesTaken: 0 },
      { rollNumber: 18, name: "Sneha Ciby", gender: "Female", monthlyLeavesTaken: 0 },
      { rollNumber: 19, name: "Sandra Sajesh", gender: "Female", monthlyLeavesTaken: 1 },
      { rollNumber: 20, name: "Sithara Pathpanabhan", gender: "Female", monthlyLeavesTaken: 0 },
    ];

    const studentDocs = rawStudents.map((s) => {
      const doc = {
        rollNumber: s.rollNumber,
        name: s.name,
        gender: s.gender,
        monthlyLeavesTaken: s.monthlyLeavesTaken,
        admissionNumber: `ADM-2026-${100 + s.rollNumber}`,
        studentId: `ADM-2026-${100 + s.rollNumber}`,
        classDivision: "Class 10-A",
        className: "Class 10-A",
        overallAttendance: "96.4",
        parentContact: `+91 94471 ${String(11000 + s.rollNumber)}`,
      };

      // Only assign user link and email for the active student login test account
      if (s.name === "Anandhu Saji") {
        doc.userId = studentUser._id;
        doc.email = "student@ghss.edu";
      }

      return doc;
    });

    const insertedStudents = await Student.insertMany(studentDocs);
    console.log(`✅ Seeded ${insertedStudents.length} students for Class 10-A.`);

    // 6. Seed an Initial Attendance Register for Today
    const todayStr = new Date().toISOString().split("T")[0];
    const attendanceRecords = insertedStudents.map((s) => ({
      studentId: s._id,
      rollNumber: s.rollNumber,
      name: s.name,
      status: s.monthlyLeavesTaken > 0 && s.rollNumber === 4 ? "Absent" : "Present",
    }));

    const presentCount = attendanceRecords.filter((r) => r.status === "Present").length;
    const absentCount = attendanceRecords.filter((r) => r.status === "Absent").length;

    await Attendance.create({
      date: todayStr,
      classDivision: "Class 10-A",
      records: attendanceRecords,
      totalPresent: presentCount,
      totalAbsent: absentCount,
      markedBy: "kathalanx@gmail.com",
    });

    console.log(`✅ Seeded attendance muster for ${todayStr}.`);

    console.log("\n=========================================");
    console.log(" SEEDING COMPLETE - READY FOR TESTING:");
    console.log("-----------------------------------------");
    console.log(" 1. ADMIN LOGIN:");
    console.log("    Email    : admin@ghss.edu");
    console.log("    Password : Admin@12345");
    console.log("-----------------------------------------");
    console.log(" 2. TEACHER LOGIN:");
    console.log("    Email    : kathalanx@gmail.com");
    console.log("    Password : Teacher@123");
    console.log("-----------------------------------------");
    console.log(" 3. STUDENT LOGIN:");
    console.log("    Email    : student@ghss.edu");
    console.log("    Password : Student@123");
    console.log("=========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Master Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
