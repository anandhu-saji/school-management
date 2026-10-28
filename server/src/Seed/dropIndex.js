import "dotenv/config";
import mongoose from "mongoose";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/ghss_student_portal?replicaSet=rs0";

async function dropLegacyIndexes() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully.");

    const attendanceCollection = mongoose.connection.collection("attendances");

    // Retrieve all active indexes on the attendances collection
    const indexes = await attendanceCollection.indexes();
    console.log(
      "Current active indexes:",
      indexes.map((idx) => idx.name)
    );

    // Drop the problematic legacy index causing E11000 duplicate key error
    const legacyIndexExists = indexes.some(
      (idx) => idx.name === "date_1_studentId_1"
    );

    if (legacyIndexExists) {
      await attendanceCollection.dropIndex("date_1_studentId_1");
      console.log("✅ Successfully dropped legacy index: 'date_1_studentId_1'");
    } else {
      console.log("ℹ️ Legacy index 'date_1_studentId_1' does not exist.");
    }

    // Ensure the new correct unique index exists for (date + classDivision)
    await attendanceCollection.createIndex(
      { date: 1, classDivision: 1 },
      { unique: true }
    );
    console.log("✅ Ensured unique compound index { date: 1, classDivision: 1 } is active.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to drop or update indexes:", error);
    process.exit(1);
  }
}

dropLegacyIndexes();