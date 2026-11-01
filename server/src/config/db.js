import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/ghss_student_portal";
  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(` MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    if (mongoUri.includes("replicaSet")) {
      console.warn("⚠️ Replica set connection failed, retrying without replicaSet parameter...");
      try {
        const fallbackUri = mongoUri.split("?")[0];
        const conn = await mongoose.connect(fallbackUri);
        console.log(` MongoDB connected successfully (fallback): ${conn.connection.host}`);
        return;
      } catch (fallbackError) {
        console.error(` MongoDB fallback connection failed: ${fallbackError.message}`);
      }
    }
    console.error(` MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
