import mongoose from "mongoose";

const singleRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    rollNumber: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "On Leave", "Leave", "Half Day"],
      default: "Present",
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },
    classDivision: {
      type: String,
      required: true,
      default: "Class 10-A",
    },
    division: {
      type: String,
    },
    records: [singleRecordSchema],
    totalPresent: {
      type: Number,
      default: 0,
    },
    totalAbsent: {
      type: Number,
      default: 0,
    },
    presentCount: {
      type: Number,
      default: 0,
    },
    absentCount: {
      type: Number,
      default: 0,
    },
    markedBy: {
      type: String,
      default: "kathalanx@gmail.com",
    },
  },
  { timestamps: true }
);

// Only this compound index should exist:
attendanceSchema.index({ date: 1, classDivision: 1 }, { unique: true });

const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
export default Attendance;
