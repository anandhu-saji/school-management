import mongoose from "mongoose";
import { softDeletePlugin } from "../plugins/softDelete.plugin.js";

const academicClassSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      unique: true, // e.g. "10-C", "11-Vocational"
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // e.g. "Class 10-C", "Class 11-Vocational"
    },
    standard: {
      type: String,
      required: true,
      trim: true, // e.g. "Class 10", "Class 11"
    },
    section: {
      type: String,
      required: true,
      trim: true, // e.g. "C", "Science", "Commerce"
    },
    wing: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Lower Primary (LP School)",
        "Upper Primary (UP School)",
        "High School Section",
        "Higher Secondary Section",
      ],
    },
    wingShort: {
      type: String,
      required: true,
      trim: true,
      enum: ["LP School", "UP School", "High School", "Higher Secondary"],
    },
    wingCode: {
      type: String,
      required: true,
      trim: true,
      enum: ["lp_school", "up_school", "high_school", "higher_secondary"],
    },
    stream: {
      type: String,
      default: "General",
      trim: true,
    },
    mentor: {
      type: String,
      default: "Assigned Class Mentor",
      trim: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      sparse: true,
    },
    room: {
      type: String,
      default: "Main Academic Block",
      trim: true,
    },
    enrolled: {
      type: Number,
      default: 0,
    },
    maxCapacity: {
      type: Number,
      default: 45,
    },
    turnoutRate: {
      type: String,
      default: "100.0%",
    },
    syncStatus: {
      type: String,
      default: "Active & Verified",
    },
    isCustom: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "academic_classes",
  }
);

// Apply soft delete plugin
academicClassSchema.plugin(softDeletePlugin);

const AcademicClass =
  mongoose.models.AcademicClass || mongoose.model("AcademicClass", academicClassSchema);

export default AcademicClass;
