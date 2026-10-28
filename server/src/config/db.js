import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/ghss_student_portal";

    const conn = await mongoose.connect(mongoUri);

    console.log(` MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;