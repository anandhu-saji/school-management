import "dotenv/config";
import mongoose from "mongoose";
import Teacher from "./src/models/Teacher.js";
import User from "./src/models/user.js";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/ghss_student_portal";

async function purgeAllTeachers() {
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

    const teacherRes = await Teacher.deleteMany({});
    console.log(`[DELETED] Teachers: ${teacherRes.deletedCount} records permanently removed.`);

    const userRes = await User.deleteMany({
      $or: [
        { role: "teacher" },
        {
          email: {
            $in: [
              "kathalanx@gmail.com",
              "priyanair@ghss.edu",
              "teacher@ghss.edu",
            ],
          },
        },
      ],
    });
    console.log(`[DELETED] Teacher user accounts: ${userRes.deletedCount} records permanently removed.`);

    console.log(
      "\n=======================================================\n" +
      "[SUCCESS] All teacher records have been completely and permanently removed!\n" +
      "======================================================="
    );
  } catch (err) {
    console.error("[ERROR] Failed to purge teachers:", err.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
}

purgeAllTeachers();
