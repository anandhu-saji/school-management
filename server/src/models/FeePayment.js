import mongoose from "mongoose";
import { validateHumanName } from "../utils/nameValidator.js";

const feePaymentSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      sparse: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v) => validateHumanName(v, "Student name") === true,
        message: (props) => validateHumanName(props.value, "Student name"),
      },
    },
    admissionNumber: {
      type: String,
      required: true,
      trim: true,
    },
    rollNumber: {
      type: Number,
    },
    classDivision: {
      type: String,
      required: true,
      trim: true,
    },
    wing: {
      type: String,
      enum: ["LP School", "UP School", "High School", "Higher Secondary"],
      default: "High School",
    },
    feeCategory: {
      type: String,
      required: true,
      enum: [
        "Bus Fee",
        "Annual Fee",
        "PTA Fund",
        "Lab & Computer Fee",
        "Special / Exam Fee",
        "Sports & Library",
        "Uniform & Books",
      ],
      default: "Annual Fee",
    },
    academicYear: {
      type: String,
      default: "2026-2027",
    },
    term: {
      type: String,
      enum: ["Annual", "Term 1", "Term 2", "Term 3", "Monthly Bus Pass", "One-Time"],
      default: "Term 1",
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
    paymentDate: {
      type: String,
      required: true,
    },
    paymentMode: {
      type: String,
      enum: [
        "Razorpay / Online",
        "UPI / Online (Google Pay / PhonePe)",
        "Net Banking",
        "Cash at School Counter",
        "Bank Challan (SBT/SBI)",
        "Demand Draft",
      ],
      default: "Razorpay / Online",
    },
    transactionReference: {
      type: String,
      trim: true,
      default: "",
    },
    razorpayOrderId: {
      type: String,
      trim: true,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
      default: null,
    },
    razorpaySignature: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ["Paid", "Partial", "Pending", "Overdue"],
      default: "Paid",
    },
    dueDate: {
      type: String,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    collectedBy: {
      type: String,
      default: "Accounts Desk / Sri. R. Krishnan",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save calculation helper
feePaymentSchema.pre("save", function () {
  if (this.totalAmount !== undefined && this.amountPaid !== undefined) {
    this.dueAmount = Math.max(0, this.totalAmount - this.amountPaid);
    if (this.amountPaid >= this.totalAmount) {
      this.status = "Paid";
    } else if (this.amountPaid > 0) {
      this.status = "Partial";
    } else {
      this.status = "Pending";
    }
  }
});

export default mongoose.model("FeePayment", feePaymentSchema);
