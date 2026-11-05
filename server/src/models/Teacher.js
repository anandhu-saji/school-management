import mongoose from "mongoose";
import { validateHumanName } from "../utils/nameValidator.js";

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
      validate: {
        validator: (v) => validateHumanName(v, "Teacher name") === true,
        message: (props) => validateHumanName(props.value, "Teacher name"),
      },
    },
    pen: {
      type: String,
      trim: true,
      sparse: true, // Permanent Employee Number, e.g. "849201"
    },
    penNumber: {
      type: String,
      trim: true,
      sparse: true,
    },
    employmentType: {
      type: String,
      default: "Permanent / Sanctioned",
      trim: true,
    },
    periodsPerWeek: {
      type: Number,
      default: 24,
    },
    gender: {
      type: String,
      enum: ["Female", "Male", "Other"],
      default: "Female",
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
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
    dob: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
    },
    appointmentDate: {
      type: String,
      default: "01/06/2016",
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    // Essential Statutory Identity Proofs
    aadharNumber: {
      type: String,
      trim: true,
      default: "",
    },
    aadharDocUrl: {
      type: String,
      trim: true,
      default: null,
    },
    aadharDocFileName: {
      type: String,
      trim: true,
      default: null,
    },
    panNumber: {
      type: String,
      trim: true,
      default: "",
    },
    panDocUrl: {
      type: String,
      trim: true,
      default: null,
    },
    panDocFileName: {
      type: String,
      trim: true,
      default: null,
    },
    penAllotmentDocUrl: {
      type: String,
      trim: true,
      default: null,
    },
    penAllotmentDocFileName: {
      type: String,
      trim: true,
      default: null,
    },
    // Essential Academic & Professional Qualification Certificates
    highestDegree: {
      type: String,
      trim: true,
      default: "Post Graduate (Master's)",
    },
    pgDegreeName: {
      type: String,
      trim: true,
      default: "M.Sc / M.A",
    },
    pgCertificateUrl: {
      type: String,
      trim: true,
      default: null,
    },
    pgCertificateFileName: {
      type: String,
      trim: true,
      default: null,
    },
    ugDegreeName: {
      type: String,
      trim: true,
      default: "B.Sc / B.A",
    },
    ugCertificateUrl: {
      type: String,
      trim: true,
      default: null,
    },
    ugCertificateFileName: {
      type: String,
      trim: true,
      default: null,
    },
    bedCollege: {
      type: String,
      trim: true,
      default: "Govt. College of Teacher Education",
    },
    bedCertificateUrl: {
      type: String,
      trim: true,
      default: null,
    },
    bedCertificateFileName: {
      type: String,
      trim: true,
      default: null,
    },
    eligibilityExam: {
      type: String,
      trim: true,
      default: "SET / KTET Qualified",
    },
    eligibilityCertificateUrl: {
      type: String,
      trim: true,
      default: null,
    },
    eligibilityCertificateFileName: {
      type: String,
      trim: true,
      default: null,
    },
    experienceCertificateUrl: {
      type: String,
      trim: true,
      default: null,
    },
    experienceCertificateFileName: {
      type: String,
      trim: true,
      default: null,
    },
    documentsVerified: {
      type: Boolean,
      default: true,
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

teacherSchema.pre("save", function () {
  if (!this.email || this.email.trim() === "") {
    this.email = undefined;
  }
  if (!this.pen && this.penNumber) {
    this.pen = this.penNumber.replace(/^PEN-?/i, "");
  }
  if (!this.penNumber && this.pen) {
    this.penNumber = this.pen.startsWith("PEN-") ? this.pen : `PEN-${this.pen}`;
  }
  if (!this.pen && !this.penNumber) {
    const num = `849${Math.floor(200 + Math.random() * 800)}`;
    this.pen = num;
    this.penNumber = `PEN-${num}`;
  }
  if (this.mentorClass && (!this.assignedClass || !this.assignedClass.includes("Mentor"))) {
    const cleanClass = this.mentorClass.replace(/^Class\s*/i, "").trim();
    this.assignedClass = `Class ${cleanClass} Mentor`;
  }
  if (!this.periods) {
    this.periods = "24 hrs / Week";
  }
  if (this.dob) {
    let birthDate;
    const trimmed = String(this.dob).trim();
    if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(trimmed)) {
      const [d, m, y] = trimmed.split(/[/-]/).map(Number);
      birthDate = new Date(y, m - 1, d);
    } else {
      birthDate = new Date(trimmed);
    }
    if (!isNaN(birthDate.getTime())) {
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      this.age = calculatedAge;
    }
  }
});

const Teacher =
  mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
export default Teacher;
