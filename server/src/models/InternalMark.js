import mongoose from "mongoose";

const studentMarkEntrySchema = new mongoose.Schema(
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
    admissionNumber: {
      type: String,
      default: "",
    },
    studentName: {
      type: String,
      required: true,
    },
    marksObtained: {
      type: Number,
      default: 0,
      min: 0,
    },
    isAbsent: {
      type: Boolean,
      default: false,
    },
    grade: {
      type: String,
      enum: ["A+", "A", "B+", "B", "C+", "C", "D+", "E", "AB"],
      default: "A",
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const internalMarkSchema = new mongoose.Schema(
  {
    examTerm: {
      type: String,
      required: true,
      trim: true,
      default: "First Terminal Examination 2026",
    },
    standard: {
      type: String,
      required: true,
      trim: true,
      default: "Standard 10 (SSLC)",
    },
    classDivision: {
      type: String,
      required: true,
      trim: true,
      default: "Class 10-A",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      default: "Mathematics",
    },
    evaluationType: {
      type: String,
      enum: [
        "Continuous Evaluation (CE)",
        "Written Exam",
        "Practical / Lab",
        "Assignment / Project",
        "Model Exam",
      ],
      default: "Continuous Evaluation (CE)",
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 80,
    },
    passMarks: {
      type: Number,
      required: true,
      default: 24,
    },
    teacherName: {
      type: String,
      default: "Mrs. Indu B Nair",
    },
    teacherEmail: {
      type: String,
      default: "",
    },
    teacherPen: {
      type: String,
      default: "",
    },
    records: [studentMarkEntrySchema],
    classAverage: {
      type: Number,
      default: 0,
    },
    highestScore: {
      type: Number,
      default: 0,
    },
    lowestScore: {
      type: Number,
      default: 0,
    },
    passPercentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Approved & Locked"],
      default: "Submitted",
    },
  },
  {
    timestamps: true,
    collection: "internal_marks",
  }
);

// Compound index for unique evaluation per class, exam term, subject, and evaluation type
internalMarkSchema.index(
  { classDivision: 1, examTerm: 1, subject: 1, evaluationType: 1 },
  { unique: true }
);

const InternalMark =
  mongoose.models.InternalMark ||
  mongoose.model("InternalMark", internalMarkSchema);

export default InternalMark;
