import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true, // e.g. "Indu B Nair"
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      default: "High School",
    },
    mentorClass: {
      type: String,
      default: "10-A",
      trim: true,
    },
    subject: {
      type: String,
      default: "Class Teacher",
    },
    phone: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: null, // AWS S3 bucket public URL
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "teachers",
  }
);

const Teacher = mongoose.model("Teacher", teacherSchema);
export default Teacher;