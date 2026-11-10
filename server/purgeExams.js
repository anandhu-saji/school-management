import "dotenv/config";
import mongoose from "mongoose";
import Exam from "./src/models/Exam.js";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/ghss_student_portal";

async function purgeAllExamData() {
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

    // Delete all exam schedule documents
    const examDeleteRes = await Exam.deleteMany({});
    console.log(
      `[DELETED] Exams collection: ${examDeleteRes.deletedCount} exam schedule records permanently removed.`
    );

    console.log(
      "\n=======================================================\n" +
      "[SUCCESS] All scheduled exam timetables have been completely and permanently removed!\n" +
      "======================================================="
    );
  } catch (err) {
    console.error("[ERROR] Failed to purge exam data:", err.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
}

purgeAllExamData();
