import mongoose from "mongoose";

const seatingEntrySchema = new mongoose.Schema(
  {
    hallNumber: {
      type: String,
      default: "Hall 01",
    },
    roomName: {
      type: String,
      default: "Room 101 (Main Block - First Floor)",
    },
    rollRange: {
      type: String,
      default: "ADM-14920 to ADM-14959",
    },
    candidateCount: {
      type: Number,
      default: 40,
    },
    invigilatorName: {
      type: String,
      default: "Mrs. Indu B Nair",
    },
    invigilatorPen: {
      type: String,
      default: "849201",
    },
  },
  { _id: false }
);

const examSchema = new mongoose.Schema(
  {
    term: {
      type: String,
      required: true,
      trim: true,
      default: "SSLC Board Examination March 2027",
    },
    standard: {
      type: String,
      required: true,
      trim: true,
      default: "Standard 10 (SSLC)",
    },
    academicYear: {
      type: String,
      default: "2025-2026",
    },
    date: {
      type: String,
      required: true,
      trim: true, // e.g. "12 March 2027, Fri"
    },
    examDate: {
      type: Date,
      default: Date.now,
    },
    startTime: {
      type: String,
      default: "09:30 AM",
      trim: true,
    },
    endTime: {
      type: String,
      default: "12:15 PM",
      trim: true,
    },
    duration: {
      type: String,
      default: "2 hrs 45 mins",
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    qpCode: {
      type: String,
      required: true,
      trim: true, // e.g. "MAL-101"
    },
    hall: {
      type: String,
      default: "Halls 01, 02, 03",
      trim: true,
    },
    totalCandidates: {
      type: Number,
      default: 242,
    },
    invigilator: {
      type: String,
      default: "Mrs. Indu B Nair, Sri. George K.",
      trim: true,
    },
    invigilatorName: {
      type: String,
      trim: true,
    },
    invigilatorPen: {
      type: String,
      trim: true,
    },
    maxMarks: {
      type: Number,
      default: 80,
    },
    passMarks: {
      type: Number,
      default: 24,
    },
    status: {
      type: String,
      enum: ["Approved & Published", "Draft / Scheduled", "Completed", "Postponed"],
      default: "Approved & Published",
    },
    instructions: {
      type: String,
      default:
        "15 minutes mandatory cool-off time provided before writing starts. Candidates must be seated by 09:15 AM with valid Sampoorna hall tickets.",
    },
    seatingPlan: {
      type: [seatingEntrySchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "exams",
  }
);

const Exam = mongoose.models.Exam || mongoose.model("Exam", examSchema);
export default Exam;
