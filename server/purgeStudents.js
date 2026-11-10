import "dotenv/config";
import mongoose from "mongoose";
import Student from "./src/models/Student.js";
import User from "./src/models/user.js";
import Attendance from "./src/models/Attendance.js";
import InternalMark from "./src/models/InternalMark.js";
import FeePayment from "./src/models/FeePayment.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/ghss_student_portal";

async function purgeAllStudentData() {
  let conn;
  try {
    try {
      conn = await mongoose.connect(MONGO_URI);
    } catch (e) {
      if (MONGO_URI.includes("?")) {
        conn = await mongoose.connect(MONGO_URI.split("?")[0]);
      } else {
        throw e;
      }
    }
    console.log(`[CONNECT] Connected to MongoDB: ${mongoose.connection.host}`);

    // 1. Delete all student documents
    const studentDeleteRes = await Student.deleteMany({});
    console.log(
      `[DELETED] Students collection: ${studentDeleteRes.deletedCount} student records permanently removed.`
    );

    // 2. Delete all student user accounts
    const userDeleteRes = await User.deleteMany({
      $or: [
        { role: "student" },
        { email: { $in: ["student@ghss.edu", "hss_student@ghss.edu"] } },
      ],
    });
    console.log(
      `[DELETED] Student user accounts: ${userDeleteRes.deletedCount} user accounts removed.`
    );

    // 3. Delete all student attendance records
    const attendanceDeleteRes = await Attendance.deleteMany({});
    console.log(
      `[DELETED] Attendance collection: ${attendanceDeleteRes.deletedCount} attendance documents removed.`
    );

    // 4. Delete all student internal marks
    const marksDeleteRes = await InternalMark.deleteMany({});
    console.log(
      `[DELETED] Internal marks collection: ${marksDeleteRes.deletedCount} mark documents removed.`
    );

    // 5. Delete all student fee payments & receipts
    const feesDeleteRes = await FeePayment.deleteMany({});
    console.log(
      `[DELETED] Fee payments collection: ${feesDeleteRes.deletedCount} fee payment records removed.`
    );

    // 6. Clean up uploaded documents directory
    const uploadsDir = path.join(__dirname, "uploads", "documents");
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        fs.unlinkSync(path.join(uploadsDir, file));
      }
      console.log(
        `[DELETED] Uploaded student document files: ${files.length} files removed.`
      );
    }

    console.log(
      "\n=======================================================\n" +
      "[SUCCESS] All student data has been completely and permanently removed!\n" +
      "======================================================="
    );
  } catch (err) {
    console.error("[ERROR] Failed to purge student data:", err.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
}

purgeAllStudentData();
