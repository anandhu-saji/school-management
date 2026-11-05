import mongoose from "mongoose";
import { validateHumanName } from "../utils/nameValidator.js";

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
      validate: {
        validator: (v) => validateHumanName(v, "Student name") === true,
        message: (props) => validateHumanName(props.value, "Student name"),
      },
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
    sampoornaId: {
      type: String,
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
    dob: {
      type: String,
      trim: true,
    },
    guardian: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || validateHumanName(v, "Guardian's name") === true,
        message: (props) => validateHumanName(props.value, "Guardian's name"),
      },
    },
    parentContact: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    // Essential Identity Proofs & Legal Records
    aadhaarNumber: {
      type: String,
      trim: true,
      sparse: true,
    },
    birthCertificateNumber: {
      type: String,
      trim: true,
    },
    // Uploaded ID Proof Files (PDF or Images)
    idProofUrl: {
      type: String,
      trim: true,
    },
    idProofType: {
      type: String,
      trim: true,
      default: "Aadhaar Card",
    },
    idProofFileName: {
      type: String,
      trim: true,
    },
    idProofFileType: {
      type: String,
      trim: true,
    },
    birthCertificateUrl: {
      type: String,
      trim: true,
    },
    birthCertificateFileName: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "Unknown"],
      default: "Unknown",
    },
    religion: {
      type: String,
      trim: true,
      default: "Hindu",
    },
    caste: {
      type: String,
      trim: true,
    },
    // Family & Guardian Details
    fatherName: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || validateHumanName(v, "Father's name") === true,
        message: (props) => validateHumanName(props.value, "Father's name"),
      },
    },
    motherName: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || validateHumanName(v, "Mother's name") === true,
        message: (props) => validateHumanName(props.value, "Mother's name"),
      },
    },
    guardianRelation: {
      type: String,
      trim: true,
      default: "Father",
    },
    altContact: {
      type: String,
      trim: true,
    },
    // Residential Address
    address: {
      houseName: { type: String, trim: true },
      street: { type: String, trim: true },
      postOffice: { type: String, trim: true },
      city: { type: String, trim: true },
      district: { type: String, trim: true, default: "Idukki" },
      state: { type: String, trim: true, default: "Kerala" },
      pincode: { type: String, trim: true },
    },
    fullAddress: {
      type: String,
      trim: true,
    },
    // Academic History / Transfer Certificate
    previousSchool: {
      type: String,
      trim: true,
    },
    tcNumber: {
      type: String,
      trim: true,
    },
    identificationMarks: {
      type: String,
      trim: true,
    },
    monthlyLeavesTaken: {
      type: Number,
      default: 0,
    },
    overallAttendance: {
      type: String,
      default: "98.4",
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

  if (!this.sampoornaId && this.rollNumber) {
    this.sampoornaId = `SMP-06042-${880 + Number(this.rollNumber)}`;
  }

  if (!this.fullAddress && this.address) {
    const parts = [
      this.address.houseName,
      this.address.street,
      this.address.postOffice,
      this.address.district,
      this.address.pincode ? `PIN: ${this.address.pincode}` : "",
    ].filter(Boolean);
    if (parts.length > 0) {
      this.fullAddress = parts.join(", ");
    }
  }
});

const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);
export default Student;
