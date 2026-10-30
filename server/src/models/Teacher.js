import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true, // e.g. "Mrs. Priya Nair"
    },
    pen: {
      type: String,
      trim: true,
      sparse: true, // Permanent Employee Number, e.g. "849201"
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "+91 94471 00000",
    },
    department: {
      type: String,
      default: "HSST Malayalam",
      trim: true,
    },
    designation: {
      type: String,
      default: "HSST",
      trim: true,
    },
    assignedClass: {
      type: String,
      default: "Class 10-A Mentor",
      trim: true,
    },
    mentorClass: {
      type: String,
      default: "10-A",
      trim: true,
    },
    subject: {
      type: String,
      default: "Malayalam",
      trim: true,
    },
    periods: {
      type: String,
      default: "24 hrs / Week",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "In Class", "On Duty", "On Leave"],
      default: "Active",
    },
    qualification: {
      type: String,
      default: "M.A, B.Ed, SET",
      trim: true,
    },
    appointmentDate: {
      type: String,
      default: "01/06/2016",
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    penAllotmentDocUrl: {
      type: String,
      default: null,
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

const Teacher =
  mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
export default Teacher;
