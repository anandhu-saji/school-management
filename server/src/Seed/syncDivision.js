import "dotenv/config";
import mongoose from "mongoose";
import Student from "../models/Student.js";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/ghss_student_portal?replicaSet=rs0";

const sync = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    // Update any variations to standard "Class 10-A"
    const result = await Student.updateMany(
      {
        $or: [
          { classDivision: { $regex: /10/i } },
          { division: { $regex: /10/i } },
          { className: { $regex: /10/i } },
        ],
      },
      {
        $set: { classDivision: "Class 10-A" },
      }
    );

    console.log(`Matched and synced ${result.modifiedCount} student records to 'Class 10-A'.`);
    const count = await Student.countDocuments({ classDivision: "Class 10-A" });
    console.log(`Total active students in 'Class 10-A': ${count}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

sync();