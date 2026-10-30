import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    // Associated User account ID
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    rollNumber: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    studentId: {
      type: String,
      trim: true,
      sparse: true,
    },
    admissionNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    classDivision: {
      type: String,
      required: true,
      trim: true,
      default: "Class 10-A",
    },
    className: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Boy", "Girl"],
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
    overallAttendance: {
      type: String,
      default: "100",
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    avatarBg: {
      type: String,
      default: "blue",
    },
    status: {
      type: String,
      enum: ["Present", "Absent"],
      default: "Present",
    },
  },
  {
    timestamps: true,
    collection: "students",
  }
);

// Synchronize aliases so both className/classDivision and studentId/admissionNumber always work
studentSchema.pre("validate", function () {
  if (this.className && !this.classDivision) {
    this.classDivision = this.className;
  } else if (this.classDivision && !this.className) {
    this.className = this.classDivision;
  }

  if (!this.studentId && this.admissionNumber) {
    this.studentId = this.admissionNumber;
  } else if (!this.admissionNumber && this.studentId) {
    this.admissionNumber = this.studentId;
  }
});

const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);
export default Student;
