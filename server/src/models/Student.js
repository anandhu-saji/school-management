import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    admissionNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    classDivision: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    parentContact: {
      type: String,
      trim: true,
    },
    monthlyLeavesTaken: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);
export default Student;